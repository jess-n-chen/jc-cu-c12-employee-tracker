// Required Packages
const inquirer = require("inquirer");
const db = require("./db/connection");

//Initial User Prompt On What Action To Take
const promptUser = () => {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        choices: [
          "View All Departments",
          "View All Roles",
          "View All Employees",
          "Add A Department",
          "Add A Role",
          "Add An Employee",
          "Update An Employee Role",
          "Exit",
        ],
      },
    ])
    .then((response) => {
      switch (response.menu) {
        case "View All Departments":
          departmentDisplay();
          break;
        case "View All Roles":
          roleDisplay();
          break;
        case "View All Employees":
          employeeDisplay();
          break;
        case "Exit":
          process.exit();
        default:
          promptUser();
        // "Add A Department",
        // "Add A Role",
        // "Add An Employee",
        // "Update An Employee Role",
      }
    });
};

// Function to Display Departments
function departmentDisplay() {
  db.query(`SELECT * FROM DEPARTMENT`, (err, result) => {
    if (err) {
      return console.error(err.message);
    }
    console.table(result);
    promptUser();
  });
}

// Function to Display Roles
function roleDisplay() {
  db.query(
    `SELECT role.id, role.title, department.name AS 'department', role.salary 
    FROM role 
    LEFT JOIN department ON role.department_id=department.id`,
    (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      console.table(result);
      promptUser();
    }
  );
}

// Function to Display Employees
function employeeDisplay() {
  db.query(
    `SELECT e.id, e.first_name, e.last_name, role.title, department.name AS 'department', role.salary, CONCAT(m.first_name, ' ', m.last_name) as 'manager' 
    FROM employee e
    LEFT JOIN role ON e.role_id=role.id
    LEFT JOIN department ON role.department_id=department.id
    LEFT JOIN employee m ON m.id=e.manager_id`,
    (err, result) => {
      if (err) {
        return console.error(err.message);
      }
      console.log(result);
      console.table(result);
      promptUser();
    }
  );
}

// Function to Add a Department
const addDepartment = () => {
  return inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the department? (Required)",
        validate: (deptInput) => {
          if (deptInput) {
            return true;
          } else {
            console.log("Please enter the name of the department!");
            return false;
          }
        },
      },
    ])
    .then((deptData) => {
      db.query(
        `INSERT INTO department (name) 
        VALUES ('${deptData.name}');`,
        (err) => {
          if (err) {
            return console.error(err.message);
            addDepartment();
          }
          console.log("Department Added!");
          promptUser();
        }
      );
    });
};

// Function to Add a Role
const addRole = () => {
  const departments = db.query("SELECT name FROM DEPARTMENT");
  return inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What is the name of the role? (Required)",
        validate: (roleInput) => {
          if (roleInput) {
            return true;
          } else {
            console.log("Please enter the name of the role!");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "salary",
        message:
          "What is the salary of the role? (Required - enter integer value)",
        validate: (salaryInput) => {
          const number = Number.isInteger(salaryInput);
          if (salaryInput && number) {
            return true;
          } else {
            console.log("Please enter a salary for the role!");
            return false;
          }
        },
      },
      {
        type: "list",
        name: "name",
        message: "What is the name of the role? (Required)",
        choices: departments,
      },
    ])
    .then((roleData) => {
      db.query(
        `INSERT INTO department (name) 
        VALUES ('${roleData.name}');`,
        (err) => {
          if (err) {
            return console.error(err.message);
            addRole();
          }
          console.log("Department Added!");
          promptUser();
        }
      );
    });
};

// Initalize Function
promptUser();
