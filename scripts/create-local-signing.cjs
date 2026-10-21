const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const folder = path.resolve('.local-signing');
fs.mkdirSync(folder, { recursive: true });
const keystore = path.join(folder, 'shopai-release.jks');
if (fs.existsSync(keystore)) throw new Error('Signing key already exists; refusing to overwrite');
const password = crypto.randomBytes(32).toString('hex');
const keytool = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'keytool.exe' : 'keytool') : 'keytool';
execFileSync(keytool, ['-genkeypair', '-keystore', keystore, '-storepass:env', 'SHOPAI_KEY_PASSWORD',
  '-keypass:env', 'SHOPAI_KEY_PASSWORD', '-alias', 'shopai-release', '-keyalg', 'RSA',
  '-keysize', '3072', '-validity', '10000', '-dname', 'CN=ShopAI Local Release, O=ShopAI, C=VN'],
  { env: { ...process.env, SHOPAI_KEY_PASSWORD: password }, stdio: 'pipe' });
fs.writeFileSync(path.join(folder, 'signing.properties'),
  `storePassword=${password}\nkeyPassword=${password}\nkeyAlias=shopai-release\n`, { mode: 0o600 });
console.log('Created local release signing key. Back up .local-signing securely; never commit it.');
