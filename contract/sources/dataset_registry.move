module message_board_addr::dataset_registry {
    use std::string::{Self, String};
    use std::vector;
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;

    /// Dataset information structure
    struct Dataset has key, store, copy, drop {
        id: u64,
        creator: address,
        cid: String,           // IPFS CID
        hash: String,          // SHA-256 hash
        name: String,
        description: String,
        license: String,
        category: String,
        tags: vector<String>,  // Vector of tags
        status: String,        // Public, Private, NFT_Gated
        price: u64,           // Price in APT (in octas)
        created_at: u64,
        updated_at: u64,
    }

    /// Registry to store all datasets
    struct DatasetRegistry has key {
        datasets: vector<Dataset>,
        next_id: u64,
    }

    /// Access record for gated datasets
    struct AccessRecord has key {
        dataset_id: u64,
        purchasers: vector<address>,
    }

    /// Events
    #[event]
    struct DatasetCreated has drop, store {
        id: u64,
        creator: address,
        cid: String,
        name: String,
    }

    #[event]
    struct AccessPurchased has drop, store {
        dataset_id: u64,
        buyer: address,
        price: u64,
    }

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_DATASET_NOT_FOUND: u64 = 2;
    const E_ACCESS_DENIED: u64 = 3;
    const E_INSUFFICIENT_PAYMENT: u64 = 4;
    const E_ALREADY_INITIALIZED: u64 = 5;

    /// Initialize the registry (call once)
    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
        
        // Check if already initialized
        assert!(!exists<DatasetRegistry>(addr), E_ALREADY_INITIALIZED);

        move_to(account, DatasetRegistry {
            datasets: vector::empty<Dataset>(),
            next_id: 1,
        });
    }

    /// Create a new dataset
    public entry fun create_dataset(
        account: &signer,
        cid: String,
        hash: String,
        name: String,
        description: String,
        license: String,
        category: String,
        tags: vector<String>,
        status: String,
        price: u64,
    ) acquires DatasetRegistry {
        let creator = signer::address_of(account);
        
        // Initialize registry if it doesn't exist
        if (!exists<DatasetRegistry>(creator)) {
            initialize(account);
        };

        let registry = borrow_global_mut<DatasetRegistry>(creator);
        let dataset_id = registry.next_id;
        
        let dataset = Dataset {
            id: dataset_id,
            creator,
            cid,
            hash,
            name,
            description,
            license,
            category,
            tags: tags,
            status,
            price,
            created_at: timestamp::now_seconds(),
            updated_at: timestamp::now_seconds(),
        };

        vector::push_back(&mut registry.datasets, dataset);
        registry.next_id = registry.next_id + 1;

        // Initialize access record for gated datasets
        if (status == string::utf8(b"NFT_Gated")) {
            move_to(account, AccessRecord {
                dataset_id,
                purchasers: vector::empty<address>(),
            });
        };

        // Emit event
        event::emit(DatasetCreated {
            id: dataset_id,
            creator,
            cid,
            name,
        });
    }

    /// Purchase access to a gated dataset
    public entry fun purchase_access(
        buyer: &signer,
        creator: address,
        dataset_id: u64,
        _payment: u64, // In a real implementation, handle APT transfer here
    ) acquires DatasetRegistry, AccessRecord {
        let buyer_addr = signer::address_of(buyer);
        
        // Get dataset info
        let registry = borrow_global<DatasetRegistry>(creator);
        let dataset_opt = find_dataset_by_id(&registry.datasets, dataset_id);
        
        assert!(vector::length(&dataset_opt) > 0, E_DATASET_NOT_FOUND);
        let dataset = *vector::borrow(&dataset_opt, 0);
        
        // Check if dataset is gated
        assert!(dataset.status == string::utf8(b"NFT_Gated"), E_ACCESS_DENIED);
        
        // In a real implementation, verify payment here
        // For now, just add to purchasers list
        
        if (exists<AccessRecord>(creator)) {
            let access_record = borrow_global_mut<AccessRecord>(creator);
            if (access_record.dataset_id == dataset_id) {
                vector::push_back(&mut access_record.purchasers, buyer_addr);
            };
        };

        // Emit event
        event::emit(AccessPurchased {
            dataset_id,
            buyer: buyer_addr,
            price: dataset.price,
        });
    }

    /// Check if user has access to a dataset
    #[view]
    public fun has_access(
        user: address,
        creator: address,
        dataset_id: u64,
    ): bool acquires DatasetRegistry, AccessRecord {
        if (!exists<DatasetRegistry>(creator)) {
            return false
        };

        let registry = borrow_global<DatasetRegistry>(creator);
        let dataset_opt = find_dataset_by_id(&registry.datasets, dataset_id);
        
        if (vector::length(&dataset_opt) == 0) {
            return false
        };

        let dataset = *vector::borrow(&dataset_opt, 0);
        
        // Public datasets are accessible to everyone
        if (dataset.status == string::utf8(b"Public")) {
            return true
        };
        
        // Private datasets only accessible to creator
        if (dataset.status == string::utf8(b"Private")) {
            return user == creator
        };
        
        // NFT gated datasets require purchase or ownership
        if (dataset.status == string::utf8(b"NFT_Gated")) {
            if (user == creator) {
                return true
            };
            
            if (exists<AccessRecord>(creator)) {
                let access_record = borrow_global<AccessRecord>(creator);
                if (access_record.dataset_id == dataset_id) {
                    return vector::contains(&access_record.purchasers, &user)
                };
            };
        };
        
        false
    }

    /// Get dataset by ID
    #[view]
    public fun get_dataset(
        creator: address,
        dataset_id: u64,
    ): (String, String, String, String, String, String, vector<String>, String, u64, u64) acquires DatasetRegistry {
        let registry = borrow_global<DatasetRegistry>(creator);
        let dataset_opt = find_dataset_by_id(&registry.datasets, dataset_id);
        
        assert!(vector::length(&dataset_opt) > 0, E_DATASET_NOT_FOUND);
        let dataset = *vector::borrow(&dataset_opt, 0);
        
        (
            dataset.cid,
            dataset.hash,
            dataset.name,
            dataset.description,
            dataset.license,
            dataset.category,
            dataset.tags,
            dataset.status,
            dataset.price,
            dataset.created_at
        )
    }

    /// Get all datasets by creator
    #[view]
    public fun get_datasets_by_creator(creator: address): vector<Dataset> acquires DatasetRegistry {
        if (!exists<DatasetRegistry>(creator)) {
            return vector::empty<Dataset>()
        };
        
        let registry = borrow_global<DatasetRegistry>(creator);
        registry.datasets
    }

    /// Helper function to find dataset by ID
    fun find_dataset_by_id(datasets: &vector<Dataset>, id: u64): vector<Dataset> {
        let result = vector::empty<Dataset>();
        let i = 0;
        let len = vector::length(datasets);
        
        while (i < len) {
            let dataset = *vector::borrow(datasets, i);
            if (dataset.id == id) {
                vector::push_back(&mut result, dataset);
                break
            };
            i = i + 1;
        };
        
        result
    }

    /// Get total number of datasets
    #[view]
    public fun get_dataset_count(creator: address): u64 acquires DatasetRegistry {
        if (!exists<DatasetRegistry>(creator)) {
            return 0
        };
        
        let registry = borrow_global<DatasetRegistry>(creator);
        vector::length(&registry.datasets)
    }
}