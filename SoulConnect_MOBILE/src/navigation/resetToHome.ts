import {CommonActions, NavigationProp, ParamListBase} from '@react-navigation/native';

export function resetToHome(navigation: NavigationProp<ParamListBase>) {
  const parent = navigation.getParent();
  const root = parent?.getParent() || parent || navigation;
  root.dispatch(CommonActions.reset({index: 0, routes: [{name: 'Home'}]}));
}
