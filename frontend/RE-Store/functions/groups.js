// Cloudflare Pages function: the site lives on pages.dev, the gallery API on Modal
const API = 'https://andersonkimball5--re-store-web.us-east.modal.run';

export const onRequest = ({ request }) => fetch(API + '/groups', { headers: request.headers });
