import axios from 'axios';
import { defineBoot } from '#q-app';

export const api = axios.create({
  baseURL: import.meta.env.QCLI_API_URL,
  timeout: 10000,
});

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: typeof api;
  }
}

export default defineBoot(({ app }) => {
  app.config.globalProperties.$api = api;
});
