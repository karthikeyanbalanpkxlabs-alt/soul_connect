export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  Login: undefined;
  About: undefined;
  Contact: undefined;
  Legal: {kind: 'privacy' | 'terms'};
  Payment: {
    planName: string;
    price: string;
    email: string;
    name: string;
    phone: string;
  };
  CustomerApp: undefined;
  StaffApp: undefined;
  ProfileDetail: {id: string};
};

export type CustomerTabParamList = {
  Discover: undefined;
  Interested: undefined;
  Account: undefined;
};

export type StaffStackParamList = {
  StaffMenu: undefined;
  Dashboard: undefined;
  Customers: undefined;
  Users: undefined;
  Transactions: undefined;
  Subscriptions: undefined;
  PaymentAccounts: undefined;
};
