import RenderAuthorize from '@/components/Authorized';
import { getAuthority } from './authority';
/* eslint-disable eslint-comments/disable-enable-pair */

/* eslint-disable import/no-mutable-exports */

let Authorized = RenderAuthorize(getAuthority()); // Reload the rights component

const reloadAuthorized = () => {
    // console.log(RenderAuthorize(getAuthority()),'545454564')
  Authorized = RenderAuthorize(getAuthority());
};
// console.log('78978787878',Authorized,getAuthority())
export { reloadAuthorized };
export default Authorized;
