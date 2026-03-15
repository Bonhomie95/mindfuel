// Root index — immediately redirects to the tabs navigator.
// This file must exist to satisfy expo-router's file-based routing.
import { Redirect } from 'expo-router';
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
