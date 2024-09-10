import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { initDatabase, getPlans, deletePlan, Plan } from "../../utils/database";

const PlanCard: React.FC<{
  plan: Plan;
  onPress: () => void;
  onLongPress: () => void;
}> = ({ plan, onPress, onLongPress }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    onLongPress={onLongPress}
  >
    {plan.imageUrl ? (
      <Image source={{ uri: plan.imageUrl }} style={styles.cardImage} />
    ) : (
      <View style={[styles.cardImage, styles.placeholderImage]}>
        <Feather name="image" size={24} color="white" />
      </View>
    )}
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{plan.title}</Text>
      <Text style={styles.cardSubtitle}>
        {new Date(plan.startDate).toLocaleDateString()} -{" "}
        {new Date(plan.endDate).toLocaleDateString()}
      </Text>
    </View>
  </TouchableOpacity>
);

const DeleteModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}> = ({ visible, onClose, onDelete }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalText}>
          Are you sure you want to delete this plan?
        </Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButton} onPress={onClose}>
            <Text style={styles.modalButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.deleteButton]}
            onPress={onDelete}
          >
            <Text style={[styles.modalButtonText, styles.deleteButtonText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default function TabOneScreen() {
  const router = useRouter();
  const [greeting, setGreeting] = useState(getGreeting());
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      const loadedPlans = await getPlans();
      setPlans(loadedPlans);
    } catch (error) {
      console.error("Failed to load plans:", error);
      Alert.alert("Error", "Failed to load plans. Please try again.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const setupDatabase = async () => {
        try {
          await initDatabase();
          await loadPlans();
        } catch (error) {
          console.error("Database initialization error:", error);
          Alert.alert(
            "Error",
            "Failed to initialize the database. Please restart the app."
          );
        }
      };

      setupDatabase();

      const intervalId = setInterval(() => {
        setGreeting(getGreeting());
      }, 60000); // Update greeting every minute

      return () => clearInterval(intervalId);
    }, [loadPlans])
  );

  const handlePlanPress = (plan: Plan) => {
    router.push({
      pathname: "/plan-details",
      params: { id: plan.id },
    });
  };

  const handleLongPress = (plan: Plan) => {
    setSelectedPlan(plan);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (selectedPlan && selectedPlan.id !== undefined) {
      try {
        await deletePlan(selectedPlan.id);
        await loadPlans(); // Reload plans after deletion
        setDeleteModalVisible(false);
        setSelectedPlan(null);
      } catch (error) {
        console.error("Failed to delete plan:", error);
        Alert.alert("Error", "Failed to delete the plan. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/menu")}>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.greeting}>{greeting}!</Text>
      <Text style={styles.welcomeMessage}>Welcome to Itinerary Planner</Text>

      <Text style={styles.sectionTitle}>Your Plans</Text>
      {plans.length > 0 ? (
        <ScrollView style={styles.cardContainer}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onPress={() => handlePlanPress(plan)}
              onLongPress={() => handleLongPress(plan)}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Your trip plans will appear here
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/new-plan")}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      <DeleteModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onDelete={handleDelete}
      />
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
    justifyContent: "space-between",
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 16,
  },
  welcomeMessage: {
    fontSize: 18,
    marginLeft: 16,
    marginTop: 4,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  cardContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  deleteButtonText: {
    color: "white",
  },
  placeholderImage: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
});

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 18) return "Good Afternoon";
  return "Good Evening";
}
