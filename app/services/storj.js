const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const axios = require('axios')
const shortid = require('shortid')
const { Environment, mnemonicGenerate } = require('storj');
const fs = require('fs')
const mime = require('mime');

module.exports = (Model, App) => {
  const logger = App.logger;

  function pwdToHex(pwd) {
    try {
      return crypto.createHash('sha256').update(pwd).digest('hex')
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  function IdToBcrypt(id) {
    try {
      return bcrypt.hashSync(id.toString(), 8)
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  function getEnvironment(email, password, mnemonic) {
    try {
      return new Environment({
        bridgeUrl: App.config.get('STORJ_BRIDGE'),
        bridgeUser: email,
        bridgePass: password,
        encryptionKey: mnemonic,
        logLevel: 4
      })
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  const RegisterBridgeUser = (email, password) => {
    const hashPwd = pwdToHex(password)
    logger.info(`${App.config.get('STORJ_BRIDGE')}/users`);
    try {
      return axios.post(
        `${App.config.get('STORJ_BRIDGE')}/users`,
        { email, password: hashPwd }
      )
    } catch (error) {
      logger.error('Bridge registration error: ' + error);
      return null;
    }
  }

  const CreateBucket = (email, password, mnemonic, name) => {
    const bucketName = name ? `${email}_${name}_${shortid.generate()}` : `${email}_ROOT`
    const storj = getEnvironment(email, password, mnemonic)
    
    try {
      return new Promise((resolve, reject) => {
        storj.createBucket(bucketName, function(err, res) {
          if (err) reject(err.message)
          resolve(res)
        })
      })
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  const DeleteBucket = (user, bucketId) => {
    const storj = getEnvironment(user.email, user.userId, user.mnemonic)
    return new Promise((resolve, reject) => {
      storj.deleteBucket(bucketId, function(err, result) {
        if (err) reject(err)
        resolve(result)
      })
    })
  }

  const StoreFile = (user, bucketId, fileName, filePath) => {
    let size;
    return new Promise((resolve, reject) => {
      const storj = getEnvironment(user.email, user.userId, user.mnemonic)
      storj.storeFile(bucketId, filePath, {
        filename: fileName,
        progressCallback(progress, downloadedBytes, totalBytes) {
          App.logger.info('progress:', progress);
          App.logger.info('totalBytes:', totalBytes);
          size = totalBytes;
        },
        finishedCallback(err, fileId) {
          if (err) {
            App.logger.info(err);
            reject(err)
          }
          App.logger.info('File complete:', fileId);
          storj.destroy();
          resolve({ fileId, size })
        }
      });
    });
  }

  const ResolveFile = (user, file) => {
    const downloadDir = './downloads'
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir);
    }

    return new Promise((resolve, reject) => {
      App.logger.info('Getting network environment')
      const storj = getEnvironment(user.email, user.userId, user.mnemonic)
      App.logger.info(`Resolving file ${file.name}`)
      const state = storj.resolveFile(file.folder.bucket, file.bucketId, `${downloadDir}/${file.name}.${file.type}`, {
        progressCallback: (progress, downloadedBytes, totalBytes) => {
          App.logger.info('progress:', progress);
        },
        finishedCallback: (err) => {
          if (err) {
            App.logger.error('Error resolving file:', err)
            reject(err)
            return err
          }
          const downloadFile = `${downloadDir}/${file.name}.${file.type}`;
          const mimetype = mime.getType(downloadFile);
          const filestream = fs.createReadStream(downloadFile);

          App.logger.info('File resolved!')
          resolve({ filestream, mimetype, downloadFile })
          storj.destroy();
          return state
        }
      })
    })
  }

  const DeleteFile = (user, bucketId, file) => {
    return new Promise((resolve, reject) => {
      const storj = getEnvironment(user.email, user.userId, user.mnemonic)
      storj.deleteFile(bucketId, file, function(err, result) {
        if (err) {
          App.logger.error(err)
          reject(err)
        }
        resolve(result)
      })
    });
  }

  const ListBucketFiles = (user, bucketId) => {
    return new Promise((resolve, reject) => {
      const storj = getEnvironment(user.email, user.userId, user.mnemonic)
      storj.listFiles(bucketId, function(err, result) {
        if (err) reject(err)
        resolve(result)
      })
    });
  }

  return {
    Name: 'Storj',
    IdToBcrypt,
    RegisterBridgeUser,
    CreateBucket,
    DeleteBucket,
    StoreFile,
    ResolveFile,
    DeleteFile,
    ListBucketFiles
  }
}
