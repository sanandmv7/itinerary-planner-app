import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getPlanById, updatePlan, Plan, Task } from "../utils/database";

const PlanDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [newTask, setNewTask] = useState<Task>({
    title: "",
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    duration: "",
    cost: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    if (id) {
      try {
        const loadedPlan = await getPlanById(parseInt(id));
        setPlan(loadedPlan);
        setTasks(sortTasks(loadedPlan.tasks || []));
      } catch (error) {
        console.error("Failed to load plan:", error);
        Alert.alert("Error", "Failed to load plan details. Please try again.");
      }
    }
  };

  const sortTasks = (tasksToSort: Task[]): Task[] => {
    return tasksToSort.sort((a, b) => {
      const dateTimeA = new Date(a.date).setHours(
        new Date(a.startTime).getHours(),
        new Date(a.startTime).getMinutes()
      );
      const dateTimeB = new Date(b.date).setHours(
        new Date(b.startTime).getHours(),
        new Date(b.startTime).getMinutes()
      );
      return dateTimeA - dateTimeB;
    });
  };

  const handleAddTask = async () => {
    if (
      !newTask.title ||
      !newTask.date ||
      !newTask.startTime ||
      !newTask.endTime
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (plan) {
      const taskDate = new Date(newTask.date);
      const tripStartDate = new Date(plan.startDate);
      const tripEndDate = new Date(plan.endDate);

      tripEndDate.setHours(23, 59, 59, 999);

      if (taskDate < tripStartDate || taskDate > tripEndDate) {
        Alert.alert("Error", "Task date must be within the trip duration.");
        return;
      }

      const startTime = new Date(newTask.startTime);
      const endTime = new Date(newTask.endTime);

      if (endTime <= startTime) {
        Alert.alert("Error", "End time must be after start time.");
        return;
      }

      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor(
        (durationMs % (1000 * 60 * 60)) / (1000 * 60)
      );

      const updatedTask = {
        ...newTask,
        duration: `${durationHours}h ${durationMinutes}m`,
        cost: newTask.cost.trim() === "" ? "0" : newTask.cost,
        id: Date.now(),
      };

      const updatedTasks = sortTasks([...tasks, updatedTask]);
      setTasks(updatedTasks);
      setIsAddTaskModalVisible(false);
      setNewTask({
        title: "",
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        duration: "",
        cost: "",
      });

      try {
        await updatePlan({ ...plan, tasks: updatedTasks });
      } catch (error) {
        console.error("Failed to save task:", error);
        Alert.alert("Error", "Failed to save the task. Please try again.");
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const updatedTasks = sortTasks(tasks.filter((task) => task.id !== taskId));
    setTasks(updatedTasks);

    if (plan) {
      try {
        await updatePlan({ ...plan, tasks: updatedTasks });
      } catch (error) {
        console.error("Failed to delete task:", error);
        Alert.alert("Error", "Failed to delete the task. Please try again.");
      }
    }
  };

  const renderTasks = () => {
    let currentDate = "";

    return tasks.map((task, index) => {
      const taskDate = new Date(task.date);
      const formattedDate = taskDate.toDateString();
      const showDateHeader = formattedDate !== currentDate;
      currentDate = formattedDate;

      return (
        <View key={task.id}>
          {showDateHeader && (
            <Text style={styles.dateHeader}>{formattedDate}</Text>
          )}
          <View style={styles.taskItem}>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDetails}>
                {new Date(task.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -
                {new Date(task.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text style={styles.taskDetails}>
                {task.duration} • $
                {task.cost === "" ? "0" : parseFloat(task.cost).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteTask(task.id!)}>
              <Feather name="trash-2" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      );
    });
  };

  const calculateBudget = (tasks: Task[]): number => {
    return tasks.reduce(
      (total, task) => total + parseFloat(task.cost || "0"),
      0
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (!plan) {
    return <Text>Loading...</Text>;
  }

  const budget = calculateBudget(tasks);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Feather name="x" size={24} color="white" />
        </TouchableOpacity>
        {plan.imageUrl ? (
          <Image source={{ uri: plan.imageUrl }} style={styles.headerImage} />
        ) : (
          <View style={[styles.headerImage, styles.placeholderImage]}>
            <Feather name="image" size={48} color="white" />
          </View>
        )}
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>{plan.title}</Text>
          <Text style={styles.headerDetails}>
            {formatDate(plan.startDate)} - {formatDate(plan.endDate)} • $
            {budget.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your Itinerary</Text>
        <ScrollView>
          {tasks.length > 0 ? (
            renderTasks()
          ) : (
            <Text style={styles.emptyStateText}>
              Your itinerary will appear here
            </Text>
          )}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddTaskModalVisible(true)}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isAddTaskModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{newTask.date.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={newTask.date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate)
                    setNewTask({ ...newTask, date: selectedDate });
                }}
                minimumDate={new Date(plan.startDate)}
                maximumDate={new Date(plan.endDate)}
              />
            )}
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text>
                {newTask.startTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={newTask.startTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowStartTimePicker(false);
                  if (selectedTime)
                    setNewTask({ ...newTask, startTime: selectedTime });
                }}
              />
            )}
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text>
                {newTask.endTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={newTask.endTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowEndTimePicker(false);
                  if (selectedTime)
                    setNewTask({ ...newTask, endTime: selectedTime });
                }}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Cost (optional)"
              value={newTask.cost}
              onChangeText={(text) => setNewTask({ ...newTask, cost: text })}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddTaskModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addTaskButton]}
                onPress={handleAddTask}
              >
                <Text style={styles.buttonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 200,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 5,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  headerDetails: {
    color: "white",
    fontSize: 16,
    marginBottom: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emptyStateText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  taskDetails: {
    color: "#888",
    marginTop: 5,
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ff3b30",
  },
  addTaskButton: {
    backgroundColor: "#007AFF",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  placeholderImage: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PlanDetailsScreen;
