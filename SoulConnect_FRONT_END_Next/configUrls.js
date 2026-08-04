let isLocalAPI = false;

const configUrls = {
  apiUrl: isLocalAPI ? "http://localhost:3000" : "https://api.soulconect.com",
};

export { configUrls };
export default configUrls;
