import crypto from 'crypto';

export class DatasetCrypto {
  private static algorithm = 'aes-256-gcm';
  
  /**
   * Generate a key from user's account address
   */
  static generateKey(userAddress: string, salt?: string): Buffer {
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(32);
    return crypto.pbkdf2Sync(userAddress, saltBuffer, 100000, 32, 'sha256');
  }

  /**
   * Encrypt file data
   */
  static encryptFile(fileBuffer: Buffer, userAddress: string): {
    encryptedData: Buffer;
    salt: string;
    iv: string;
    authTag: string;
  } {
    const salt = crypto.randomBytes(32);
    const key = this.generateKey(userAddress, salt.toString('hex'));
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from(userAddress));
    
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt file data
   */
  static decryptFile(
    encryptedData: Buffer,
    userAddress: string,
    salt: string,
    iv: string,
    authTag: string
  ): Buffer {
    const key = this.generateKey(userAddress, salt);
    const ivBuffer = Buffer.from(iv, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from(userAddress));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
    
    return decrypted;
  }

  /**
   * Generate file hash for integrity verification
   */
  static generateFileHash(fileBuffer: Buffer): string {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Verify file integrity
   */
  static verifyFileHash(fileBuffer: Buffer, expectedHash: string): boolean {
    const actualHash = this.generateFileHash(fileBuffer);
    return actualHash === expectedHash;
  }

  /**
   * Create access token for file download
   */
  static createAccessToken(userAddress: string, datasetId: string, cid: string): string {
    const payload = {
      userAddress,
      datasetId,
      cid,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    const secret = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY || 'fallback-secret';
    const token = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return Buffer.from(JSON.stringify({ ...payload, token })).toString('base64');
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): {
    valid: boolean;
    payload?: any;
    error?: string;
  } {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (decoded.expires < Date.now()) {
        return { valid: false, error: 'Token expired' };
      }
      
      const { token: providedToken, ...payload } = decoded;
      const secret = process.env.NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY || 'fallback-secret';
      const expectedToken = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      if (providedToken !== expectedToken) {
        return { valid: false, error: 'Invalid token signature' };
      }
      
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Invalid token format' };
    }
  }
}