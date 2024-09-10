import * as SQLite from "expo-sqlite/legacy";

let db: SQLite.WebSQLDatabase;

function getDatabase(): SQLite.WebSQLDatabase {
  if (!db) {
    db = SQLite.openDatabase("plannerapp.db");
  }
  return db;
}

export interface Task {
  id?: number;
  title: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: string;
  cost: string;
}

export interface Plan {
  id?: number;
  title: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  tasks?: Task[];
}

export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    const db = getDatabase();
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS plans (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, startDate TEXT, endDate TEXT, imageUrl TEXT, tasks TEXT)",
        [],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const savePlan = (plan: Plan) => {
  return new Promise<void>((resolve, reject) => {
    const db = getDatabase();
    const tasksJson = JSON.stringify(plan.tasks || []);
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO plans (title, startDate, endDate, imageUrl, tasks) VALUES (?, ?, ?, ?, ?)",
        [plan.title, plan.startDate, plan.endDate, plan.imageUrl, tasksJson],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getPlans = () => {
  return new Promise<Plan[]>((resolve, reject) => {
    const db = getDatabase();
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM plans",
        [],
        (_, { rows }) => {
          const plans = rows._array.map((row) => ({
            ...row,
            tasks: JSON.parse(row.tasks || "[]").map((task: any) => ({
              ...task,
              date: new Date(task.date),
              startTime: new Date(task.startTime),
              endTime: new Date(task.endTime),
            })),
          }));
          resolve(plans);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getPlanById = (id: number) => {
  return new Promise<Plan>((resolve, reject) => {
    const db = getDatabase();
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM plans WHERE id = ?",
        [id],
        (_, { rows }) => {
          if (rows.length > 0) {
            const plan = rows.item(0);
            plan.tasks = JSON.parse(plan.tasks || "[]").map((task: any) => ({
              ...task,
              date: new Date(task.date),
              startTime: new Date(task.startTime),
              endTime: new Date(task.endTime),
            }));
            resolve(plan);
          } else {
            reject(new Error("Plan not found"));
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const updatePlan = (plan: Plan) => {
  return new Promise<void>((resolve, reject) => {
    if (plan.id === undefined) {
      reject(new Error("Plan ID is undefined"));
      return;
    }

    const db = getDatabase();
    const tasksJson = JSON.stringify(plan.tasks || []);
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE plans SET title = ?, startDate = ?, endDate = ?, imageUrl = ?, tasks = ? WHERE id = ?",
        [
          plan.title,
          plan.startDate,
          plan.endDate,
          plan.imageUrl,
          tasksJson,
          plan.id!,
        ],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deletePlan = (id: number) => {
  return new Promise<void>((resolve, reject) => {
    const db = getDatabase();
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM plans WHERE id = ?",
        [id],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};
