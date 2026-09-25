const appIds = new Set(['com.tanidikvar.app', 'com.tanidikvar.app.preview', 'com.tanidikvar.app.dev']);
const paths = ['/soru/*', '/universite/*', '/program/*', '/profiles/*'];

export function appleAssociation(team: string | undefined, bundle: string | undefined) {
  if (!team || !/^[A-Z0-9]{10}$/.test(team) || !bundle || !appIds.has(bundle)) return null;
  return { applinks: { apps: [], details: [{ appID: `${team}.${bundle}`, paths }] } };
}
export function androidAssociation(bundle: string | undefined, fingerprints: string | undefined) {
  if (!bundle || !appIds.has(bundle) || !fingerprints) return null;
  const values = fingerprints.split(',').map(value => value.trim());
  if (!values.length || values.some(value => !/^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(value))) return null;
  return [{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: bundle, sha256_cert_fingerprints: values } }];
}
