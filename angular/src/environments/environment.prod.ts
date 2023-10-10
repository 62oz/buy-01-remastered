const baseURL = '/api';

export const environment = {
  production: true,
  authCheckURL: `${baseURL}/auth/check`,
  loginURL: `${baseURL}/auth/signin`,
  signupURL: `${baseURL}/auth/signup`,
  usersURL: `${baseURL}/users`,
  productsURL: `${baseURL}/products`,
  userProductsURL: `${baseURL}/products/user/`,
  mediaURL: `${baseURL}/media`,
  userMediaURL: `${baseURL}/media/user/`,
  productMediaURL: `${baseURL}/media/product/`,
  logoutURL: `${baseURL}/auth/signout`,
};
