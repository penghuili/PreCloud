import Ionicon from 'react-native-vector-icons/Ionicons';

function Icon({ name, size, color, onPress }) {
  return <Ionicon name={name} size={size} color={color} onPress={onPress} />;
}

export default Icon;
