INSERT INTO department(name)
VALUES  ("Customer Success"), 
        ("Solution Architecture"), 
        ("Support"), 
        ("Managed Services"), 
        ("Account Management"), 
        ("Sales");

INSERT INTO role(title, salary, department_id)
VALUES 
    ("VP Customer Success", 200000, 1),
    ("CSM", 60000, 1),
    ("Solutions Architect", 75000, 2),
    ("Customer Support Rep", 50000, 3),
    ("SDR", 40000, 6);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES
    ("Twilight", "Sparkle", 1, NULL),
    ("Rainbow", "Dash", 2, 1),
    ("Princess", "Cadance", 2, 1),
    ("Pinkie", "Pie", 3, 0),
    ("Princess", "Luna", 4, 1),
    ("Sunset", "Shimmer", 5, 0);