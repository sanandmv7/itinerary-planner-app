import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import licensesData from "../licenses.json";

interface License {
  licenses: string;
  repository: string;
  licenseUrl: string;
  parents: string;
}

export default function LicensesScreen() {
  const router = useRouter();

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err)
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Open Source Libraries</Text>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {Object.entries(licensesData).map(
          ([packageName, licenseInfo]: [string, License]) => (
            <View key={packageName} style={styles.licenseItem}>
              <Text style={styles.licenseName}>{packageName}</Text>
              <Text style={styles.licenseType}>
                {licenseInfo.licenses} License
              </Text>
              <TouchableOpacity
                onPress={() => openLink(licenseInfo.repository)}
              >
                <Text style={styles.licenseLink}>View Repository</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openLink(licenseInfo.licenseUrl)}
              >
                <Text style={styles.licenseLink}>View License</Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  licenseItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  licenseName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  licenseType: {
    fontSize: 14,
    marginBottom: 8,
  },
  licenseLink: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
});
