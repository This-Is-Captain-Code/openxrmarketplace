import PermissionScreen from '../PermissionScreen';

export default function PermissionScreenExample() {
  return (
    <PermissionScreen 
      onRequestPermission={() => console.log('Request permission triggered')}
      error={null}
    />
  );
}
