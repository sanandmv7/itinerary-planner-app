import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
} from "react-native-svg";

interface MenuItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <MaterialIcons name={icon} size={24} color="#333" />
    <Text style={styles.menuItemText}>{title}</Text>
  </TouchableOpacity>
);

const AppIcon = () => (
  <Svg width="50" height="50" viewBox="0 0 200 200">
    <Defs>
      <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#00C9A7" />
        <Stop offset="100%" stopColor="#00C9A7" />
      </LinearGradient>
      <LinearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" />
        <Stop offset="100%" stopColor="#F0F0F0" />
      </LinearGradient>
    </Defs>
    <Rect
      x="0"
      y="0"
      width="200"
      height="200"
      rx="50"
      ry="50"
      fill="url(#bgGradient)"
    />
    <Path
      d="M100 40 C 70 40, 50 60, 50 90 C 50 130, 100 170, 100 170 C 100 170, 150 130, 150 90 C 150 60, 130 40, 100 40 Z"
      fill="url(#pinGradient)"
    />
    <Circle cx="100" cy="90" r="30" fill="#014E3C" />
    <Path
      d="M85 90 L95 100 L115 80"
      stroke="#FFFFFF"
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function MenuScreen() {
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err)
    );
  };

  const getAppVersion = (): string => {
    if (Platform.OS === "web") {
      return Constants.manifest2?.extra?.expoClient?.version ?? "Unknown";
    }
    return (
      Constants.expoConfig?.version ?? Constants.manifest?.version ?? "Unknown"
    );
  };

  const appVersion = getAppVersion();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Menu</Text>
      </View>
      <View style={styles.content}>
        <MenuItem
          icon="info"
          title="About"
          onPress={() =>
            openLink("https://github.com/sanandmv7/itinerary-planner-app")
          }
        />
        <MenuItem
          icon="bug-report"
          title="Report a bug"
          onPress={() =>
            openLink(
              "https://github.com/sanandmv7/itinerary-planner-app/issues/new"
            )
          }
        />
        <MenuItem
          icon="feedback"
          title="Feedback"
          onPress={() => openLink("https://forms.gle/qKYahftqpdnrLhZ49")}
        />
        <MenuItem
          icon="local-cafe"
          title="Support"
          onPress={() => openLink("https://buymeacoffee.com/sanandmv7")}
        />
        <MenuItem
          icon="description"
          title="Open Source Libraries"
          onPress={() => router.push("/licenses")}
        />
      </View>
      <View style={styles.footer}>
        <AppIcon />
        <Text style={styles.versionText}>Version {appVersion}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 15,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
  },
});
