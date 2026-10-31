import * as Yup from 'yup';
import {savePublicCustomer} from './api';
import {storageGetJson, storageKeys, storageSetJson} from './storage';

export const registrationSchema = Yup.object({
  registerFor: Yup.string().required('Please select who you are registering for'),
  firstName: Yup.string().trim().required('First name is required').min(2, 'At least 2 characters'),
  lastName: Yup.string().trim().required('Last name is required'),
  dob: Yup.string()
    .required('Date of birth is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .test('age-check', 'Must be at least 18 years old', value => {
      if (!value) {
        return false;
      }
      const birthDate = new Date(value);
      if (Number.isNaN(birthDate.getTime())) {
        return false;
      }
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const month = today.getMonth() - birthDate.getMonth();
      if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
      }
      return age >= 18;
    }),
  gender: Yup.string().required('Please select gender'),
  mobile: Yup.string().required('Mobile number is required').matches(/^[0-9]{10}$/, 'Enter 10 digits'),
  email: Yup.string().required('Email is required').email('Enter a valid email'),
  district: Yup.string().required('Please select a district'),
  motherTongue: Yup.string().required('Mother tongue is required'),
  maritalStatus: Yup.string().required('Marital status is required'),
  profilePhoto: Yup.string().trim().required('Profile photo URL is required'),
  familyPhoto: Yup.string().trim().required('Family photo URL is required'),
  identityProof: Yup.string().trim().required('ID proof URL is required'),
});

export interface RegistrationValues {
  registerFor: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  district: string;
  taluk: string;
  religion: string;
  caste: string;
  motherTongue: string;
  maritalStatus: string;
  education: string;
  profession: string;
  income: string;
  height: string;
  aboutMe: string;
  preferences: string;
  profilePhoto: string;
  familyPhoto: string;
  identityProof: string;
}

export const emptyRegistration: RegistrationValues = {
  registerFor: 'For myself',
  firstName: '',
  lastName: '',
  dob: '',
  gender: '',
  mobile: '',
  email: '',
  district: '',
  taluk: '',
  religion: '',
  caste: '',
  motherTongue: 'Tamil',
  maritalStatus: 'Never Married',
  education: '',
  profession: '',
  income: 'Prefer not to say',
  height: '',
  aboutMe: '',
  preferences: '',
  profilePhoto: '',
  familyPhoto: '',
  identityProof: '',
};

export function buildCustomerFixture(
  values: RegistrationValues,
  planId: string,
  verified: {email: boolean; phone: boolean},
) {
  const id = Date.now().toString(16) + Math.random().toString(16).substring(2, 10);
  return {
    customer_id: `cid_${id}`,
    profile_created_for: values.registerFor,
    whoiam_register: values.registerFor,
    first_name: values.firstName,
    last_name: values.lastName,
    email: values.email,
    role: 'customer_g',
    dob: values.dob,
    gender: values.gender,
    phone_number: values.mobile,
    phone_code: '+91',
    email_verified: verified.email,
    phone_verified: verified.phone,
    mobile_verified: verified.phone,
    is_email_verified: verified.email,
    is_phone_verified: verified.phone,
    district: values.district,
    taluk_town: values.taluk,
    state: 'tamilnadu',
    zipcode: '641035',
    religion: values.religion,
    caste: values.caste,
    mother_tongue: values.motherTongue,
    maritial_status: values.maritalStatus,
    education: values.education,
    profession: values.profession,
    annual_income: values.income,
    height: values.height,
    about_self: values.aboutMe,
    partner_preference: values.preferences,
    subscription_type: planId,
    subscription_view_access: 4,
    image: [{url: values.profilePhoto, default: true}],
    family_photos: [values.familyPhoto],
    video: '',
    identity_proff: values.identityProof,
    transaction: {history: []},
    public_verify: false,
    keycloakId: id,
  };
}

export async function rememberPendingRegistration(
  fixture: Record<string, unknown>,
  plan: {name: string; price: string; features?: string[]},
  values: RegistrationValues,
) {
  await storageSetJson(storageKeys.pendingRegistration, fixture);
  await storageSetJson(storageKeys.pendingPlan, plan);
  await storageSetJson(storageKeys.registrationData, {
    email: values.email,
    firstName: values.firstName,
    mobile: values.mobile,
    phone: values.mobile,
  });
}

export async function completePaidRegistration(input: {
  orderId: string;
  txnId?: string;
  planName?: string;
  amount?: string;
  paymentType?: string;
}) {
  const fixture =
    (await storageGetJson<Record<string, any>>(storageKeys.pendingRegistration)) || {};
  const plan = await storageGetJson<{name?: string; price?: string}>(storageKeys.pendingPlan);
  const amountNumber =
    Number(String(input.amount || plan?.price || '0').replace(/[^0-9.]/g, '')) || 0;
  const now = new Date();
  const purchaseDate = now.toISOString();
  const dateCode = purchaseDate.slice(0, 10).replace(/-/g, '');
  const orderId = input.orderId || `ORD${dateCode}0001`;
  const txnId = input.txnId || `PAY${dateCode}0001`;
  const targetPlan = (
    input.planName ||
    fixture.subscription_type ||
    plan?.name ||
    'premium'
  ).toLowerCase();

  fixture.transaction = {
    history: [
      {
        plan: targetPlan,
        purchase_date: purchaseDate,
        expired_date: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        current_plan: true,
        summary: {
          order_id: orderId,
          invoice_no: `INV${dateCode}0001`,
          payment_id: txnId,
          amount: amountNumber,
          tax: 0,
          discount: 0,
          total_amount: amountNumber,
          payment_status: 'Success',
          payment_method: 'omniware',
          payment_type: input.paymentType || 'Omniware NetBanking',
          currency_type: '₹',
          transaction_date: purchaseDate,
        },
      },
    ],
  };
  fixture.subscription_type = targetPlan;
  const result = await savePublicCustomer(fixture);
  return {result, orderId, txnId, amount: amountNumber, planName: targetPlan, email: fixture.email};
}
