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
        case "Add A Department":
          addDepartment();
          break;
        case "Add A Role":
          addRole();
          break;
        case "Add An Employee":
          addEmployee();
          break;
        case "Update An Employee Role":
          updateEmployee();
          break;
        case "Exit":
          process.exit();
        default:
          promptUser();
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
      console.table(result);
      promptUser();
    }
  );
}

// Function to Add a Department
const addDepartment = () => {
  console.log(`
=====================
Add a New Department
=====================
`);

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
          }
          console.log("Department Added!");
          promptUser();
        }
      );
    });
};

// Function to Add a Role
const addRole = () => {
  console.log(`
===============
Add a New Role
===============
`);

  db.query(`SELECT name FROM DEPARTMENT`, (err, result) => {
    if (err) {
      return console.error(err.message);
    } else {
      const deptChoices = result.map(({ name }) => name);
      inquirer
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
              const number = !isNaN(salaryInput);
              if (salaryInput && number) {
                return true;
              } else {
                console.log("Please enter a valid salary for the role!");
                return false;
              }
            },
          },
          {
            type: "list",
            name: "department",
            message: "Which department does the role belong to? (Required)",
            choices: deptChoices,
          },
        ])
        .then((roleData) => {
          db.query(
            `INSERT INTO role (title, salary, department_id)
                VALUES ("${roleData.name}", ${roleData.salary}, ${
              deptChoices.indexOf(roleData.department) + 1
            })`,
            (err) => {
              if (err) {
                return console.error(err.message);
              }
              console.log("Role Added!");
              promptUser();
            }
          );
        });
    }
  });
};

// Function to Add Employee
const addEmployee = () => {
  console.log(`
===================
Add a New Employee
===================
`);

  db.query(`SELECT title FROM role`, (err, result) => {
    if (err) {
      return console.error(err.message);
    } else {
      const roleChoices = result.map(({ title }) => title);
      db.query(
        `SELECT CONCAT(first_name, ' ', last_name) as 'manager' FROM employee`,
        (err, result) => {
          if (err) {
            return console.error(err.message);
          } else {
            const mgrChoices = result.map(({ manager }) => manager);
            mgrChoices.unshift("None");

            inquirer
              .prompt([
                {
                  type: "input",
                  name: "first_name",
                  message: "What is the employee's first name? (Required)",
                  validate: (firstInput) => {
                    if (firstInput) {
                      return true;
                    } else {
                      console.log("Please enter the employee's first name!");
                      return false;
                    }
                  },
                },
                {
                  type: "input",
                  name: "last_name",
                  message: "What is the employee's last name? (Required)",
                  validate: (lastInput) => {
                    if (lastInput) {
                      return true;
                    } else {
                      console.log("Please enter the employee's last name!");
                      return false;
                    }
                  },
                },
                {
                  type: "list",
                  name: "role",
                  message: "What is the employee's role? (Required)",
                  choices: roleChoices,
                },
                {
                  type: "list",
                  name: "manager",
                  message: "Who is the employee's manager? (Required)",
                  choices: mgrChoices,
                },
              ])
              .then((empData) => {
                let manager = null;
                if (empData != "None") {
                  manager = mgrChoices.indexOf(empData.manager);
                }
                db.query(
                  `INSERT INTO employee(first_name, last_name, role_id, manager_id)
                            VALUES ("${empData.first_name}", "${
                    empData.last_name
                  }", ${roleChoices.indexOf(empData.role) + 1}, ${manager})`,
                  (err) => {
                    if (err) {
                      return console.error(err.message);
                    }
                    console.log("Employee Added!");
                    promptUser();
                  }
                );
              });
          }
        }
      );
    }
  });
};

// Function to Update Employee Role
const updateEmployee = () => {
  console.log(`
===================
Update an Employee
===================
`);

  db.query(`SELECT title FROM role`, (err, result) => {
    if (err) {
      return console.error(err.message);
    } else {
      const roleChoices = result.map(({ title }) => title);
      db.query(
        `SELECT CONCAT(first_name, ' ', last_name) as 'employee' FROM employee`,
        (err, result) => {
          if (err) {
            return console.error(err.message);
          } else {
            const empChoices = result.map(({ employee }) => employee);
            inquirer
              .prompt([
                {
                  type: "list",
                  name: "employee",
                  message:
                    "Which employee's role do you want to update? (Required)",
                  choices: empChoices,
                },
                {
                  type: "list",
                  name: "role",
                  message:
                    "Which role do you want to assign the selected employee? (Required)",
                  choices: roleChoices,
                },
              ])
              .then((empData) => {
                db.query(
                  `UPDATE employee SET role_id=${
                    roleChoices.indexOf(empData.role) + 1
                  } WHERE id=${empChoices.indexOf(empData.employee) + 1}`,
                  (err) => {
                    if (err) {
                      return console.error(err.message);
                    }
                    console.log("Employee Updated!");
                    promptUser();
                  }
                );
              });
          }
        }
      );
    }
  });
};

// Initalize Function
promptUser();
