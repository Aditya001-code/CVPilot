# Pre-populated and in-memory cache for role skills
# Allows instant (0ms) role-skill matching without waiting on external LLM calls

ROLE_SKILLS_CACHE = {
    "AI Engineer": [
        "Python", "PyTorch", "TensorFlow", "Machine Learning", "Deep Learning",
        "NLP", "LLM", "Generative AI", "Computer Vision", "Docker",
        "Git", "REST API", "SQL", "Pandas", "Scikit-learn"
    ],
    "Machine Learning Engineer": [
        "Python", "Scikit-learn", "TensorFlow", "PyTorch", "Machine Learning",
        "Deep Learning", "Pandas", "NumPy", "SQL", "Docker",
        "Git", "CI/CD", "REST API", "AWS", "Linux"
    ],
    "Deep Learning Engineer": [
        "Python", "PyTorch", "TensorFlow", "Keras", "Deep Learning",
        "Computer Vision", "NLP", "CUDA", "CNN", "RNN",
        "Transformers", "Git", "Linux", "Docker", "NumPy"
    ],
    "Generative AI Engineer": [
        "Python", "LLM", "Generative AI", "Prompt Engineering", "OpenAI",
        "Gemini", "LangChain", "PyTorch", "Transformers", "REST API",
        "Vector Databases", "Docker", "Git", "FastAPI", "NLP"
    ],
    "Data Scientist": [
        "Python", "R", "SQL", "Pandas", "NumPy",
        "Scikit-learn", "Matplotlib", "Seaborn", "Machine Learning", "Statistics",
        "Data Science", "Git", "Tableau", "Power BI", "Excel"
    ],
    "Data Analyst": [
        "SQL", "Python", "Excel", "Power BI", "Tableau",
        "Pandas", "Data Science", "Statistics", "Problem Solving", "Communication",
        "Git", "MySQL", "PostgreSQL", "Matplotlib", "Seaborn"
    ],
    "Business Analyst": [
        "SQL", "Excel", "Power BI", "Tableau", "Communication",
        "Problem Solving", "Agile", "Scrum", "Requirements Gathering", "Data Analysis",
        "JIRA", "Process Mapping", "Python", "Presentation", "Stakeholder Management"
    ],
    "Frontend Developer": [
        "HTML", "CSS", "JavaScript", "TypeScript", "React",
        "Tailwind CSS", "Bootstrap", "Git", "GitHub", "REST API",
        "Responsive Design", "Next.js", "Redux", "Webpack", "Vite"
    ],
    "React Developer": [
        "React", "JavaScript", "TypeScript", "HTML", "CSS",
        "Redux", "Tailwind CSS", "Next.js", "REST API", "Git",
        "GitHub", "Jest", "Vite", "Node.js", "Responsive Design"
    ],
    "Angular Developer": [
        "Angular", "TypeScript", "JavaScript", "HTML", "CSS",
        "RxJS", "NgRx", "REST API", "Git", "Bootstrap",
        "Karma", "Jasmine", "Node.js", "JSON", "Webpack"
    ],
    "Vue.js Developer": [
        "Vue.js", "JavaScript", "TypeScript", "HTML", "CSS",
        "Vuex", "Pinia", "Nuxt.js", "REST API", "Git",
        "Tailwind CSS", "Vite", "Responsive Design", "Node.js", "GitHub"
    ],
    "Backend Developer": [
        "Python", "Node.js", "Java", "REST API", "SQL",
        "PostgreSQL", "MySQL", "MongoDB", "Docker", "Git",
        "Redis", "Microservices", "Linux", "FastAPI", "Express.js"
    ],
    "Python Developer": [
        "Python", "Django", "Flask", "FastAPI", "SQL",
        "PostgreSQL", "MySQL", "REST API", "Git", "Docker",
        "Pandas", "Linux", "Redis", "Celery", "Unit Testing"
    ],
    "Django Developer": [
        "Python", "Django", "Django REST Framework", "SQL", "PostgreSQL",
        "MySQL", "HTML", "CSS", "Git", "Docker",
        "Celery", "Redis", "Linux", "REST API", "Nginx"
    ],
    "Flask Developer": [
        "Python", "Flask", "SQLAlchemy", "REST API", "SQL",
        "PostgreSQL", "MySQL", "Git", "Docker", "HTML",
        "CSS", "JavaScript", "Linux", "Celery", "Redis"
    ],
    "Node.js Developer": [
        "Node.js", "Express.js", "JavaScript", "TypeScript", "MongoDB",
        "PostgreSQL", "REST API", "Git", "Docker", "Redis",
        "Microservices", "GraphQL", "JWT", "Linux", "SQL"
    ],
    "Java Developer": [
        "Java", "Spring", "Spring Boot", "SQL", "MySQL",
        "PostgreSQL", "Hibernate", "REST API", "Git", "Maven",
        "Docker", "Microservices", "JUnit", "Linux", "OOP"
    ],
    "Spring Boot Developer": [
        "Java", "Spring Boot", "Spring Data JPA", "Hibernate", "REST API",
        "Microservices", "SQL", "PostgreSQL", "MySQL", "Git",
        "Docker", "Maven", "JUnit", "Kafka", "Redis"
    ],
    "Full Stack Developer": [
        "JavaScript", "TypeScript", "React", "Node.js", "HTML",
        "CSS", "SQL", "PostgreSQL", "MongoDB", "Git",
        "REST API", "Docker", "Express.js", "Tailwind CSS", "Linux"
    ],
    "MERN Stack Developer": [
        "MongoDB", "Express.js", "React", "Node.js", "JavaScript",
        "HTML", "CSS", "Tailwind CSS", "REST API", "Git",
        "GitHub", "Redux", "JSON", "JWT", "TypeScript"
    ],
    "Software Engineer": [
        "Python", "Java", "C++", "JavaScript", "Data Structures",
        "Algorithms", "SQL", "Git", "Object-Oriented Programming", "REST API",
        "System Design", "Linux", "Docker", "CI/CD", "Problem Solving"
    ],
    "DevOps Engineer": [
        "Docker", "Kubernetes", "AWS", "CI/CD", "Jenkins",
        "Terraform", "Linux", "Git", "Ansible", "Python",
        "Bash", "Monitoring", "Cloud Computing", "Nginx", "GitHub"
    ],
    "Cloud Engineer": [
        "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
        "Terraform", "Linux", "Networking", "Python", "CI/CD",
        "Cloud Security", "IAM", "Serverless", "Git", "Bash"
    ],
    "Cybersecurity Analyst": [
        "Network Security", "Ethical Hacking", "Cyber Security", "Linux", "SIEM",
        "SOC", "Vulnerability Assessment", "Firewalls", "Wireshark", "Python",
        "Incident Response", "Penetration Testing", "Cryptography", "Risk Assessment", "Compliance"
    ],
    "Mobile App Developer": [
        "Flutter", "React Native", "Android", "Kotlin", "Swift",
        "Java", "JavaScript", "Dart", "REST API", "Git",
        "Firebase", "Mobile UI/UX", "iOS", "State Management", "SQLite"
    ],
    "Android Developer": [
        "Android", "Kotlin", "Java", "XML", "Android SDK",
        "Room Database", "Retrofit", "REST API", "Git", "MVVM",
        "Jetpack Compose", "Coroutines", "Firebase", "Unit Testing", "Material Design"
    ],
    "Flutter Developer": [
        "Flutter", "Dart", "REST API", "Firebase", "Git",
        "State Management", "Bloc", "Provider", "Mobile UI/UX", "Android",
        "iOS", "JSON", "GitHub", "SQLite", "Clean Architecture"
    ],
    "UI/UX Designer": [
        "Figma", "Adobe XD", "Wireframing", "Prototyping", "User Research",
        "Design Systems", "HTML", "CSS", "Usability Testing", "Interaction Design",
        "Information Architecture", "Mobile Design", "Responsive Design", "Typography", "Communication"
    ],
    "QA Engineer": [
        "Manual Testing", "Automation Testing", "Selenium", "PyTest", "JUnit",
        "Test Plans", "Bug Tracking", "JIRA", "Postman", "REST API",
        "Git", "SQL", "Regression Testing", "Performance Testing", "CI/CD"
    ],
    "Database Administrator": [
        "SQL", "MySQL", "PostgreSQL", "Oracle", "MongoDB",
        "Database Optimization", "Indexing", "Backup & Recovery", "Stored Procedures", "Linux",
        "Data Modeling", "Replication", "Security", "Query Tuning", "ETL"
    ]
}