# ☁️ VAULT — Distributed File Storage System

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Distributed%20Storage-6C63FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Storage-Amazon%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white" />
  <img src="https://img.shields.io/badge/Compute-Amazon%20EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployment-Vercel%20%2B%20AWS-000000?style=for-the-badge" />
</p>

<p align="center">
  <strong>A production-oriented cloud file storage platform inspired by Dropbox / Google Drive.</strong>
  <br />
  Chunked uploads • resumable transfers • object storage • metadata • folders • sharing • access control • cloud deployment
</p>

<p align="center">
  <a href="https://vault-frontend-beryl.vercel.app/">🚀 Live Demo</a>
  &nbsp; • &nbsp;
  <a href="https://github.com/pratik3847/distributed-file-storage-system">💻 Source Code</a>
</p>

---

## ✨ What is Vault?

**Vault** is a full-stack distributed file storage system designed to solve a simple but non-trivial problem:

> **How do you build a cloud file manager that can reliably store, organize, upload, retrieve, and share files without treating the database itself as a blob store?**

Instead of putting large binary files directly inside PostgreSQL, Vault separates:

```mermaid
flowchart LR
    U["👤 User"] --> UI["⚛️ React Frontend"]

    UI --> API["🌐 REST API<br/>Node.js + Express"]

    API --> META["🗄️ PostgreSQL<br/>File Metadata"]
    API --> CACHE["⚡ Redis<br/>Temporary / Fast State"]
    API --> OBJECT["☁️ Amazon S3<br/>Actual File Objects"]

    META -. "describes" .-> OBJECT
    CACHE -. "accelerates" .-> API

    style U fill:#111827,color:#fff
    style UI fill:#61DAFB,color:#000
    style API fill:#339933,color:#fff
    style META fill:#4169E1,color:#fff
    style CACHE fill:#DC382D,color:#fff
    style OBJECT fill:#569A31,color:#fff
```

### The core idea

```text
PostgreSQL  →  WHAT the file is
S3          →  WHERE the actual bytes live
Redis       →  FAST temporary / operational state
```

That separation is the foundation of the system.

---

# 🧭 Table of Contents

- [✨ What is Vault?](#-what-is-vault)
- [🏗️ System Architecture](#️-system-architecture)
- [🗺️ Architecture at a Glance](#️-architecture-at-a-glance)
- [🧱 Major Components](#-major-components)
- [⚛️ Frontend Architecture](#️-frontend-architecture)
- [🧠 Backend Architecture](#-backend-architecture)
- [🔐 Authentication Flow](#-authentication-flow)
- [📦 File Upload Architecture](#-file-upload-architecture)
- [🔄 Resumable Chunk Upload](#-resumable-chunk-upload)
- [☁️ S3 Storage Architecture](#️-s3-storage-architecture)
- [🗄️ Metadata Architecture](#️-metadata-architecture)
- [⚡ Redis Architecture](#-redis-architecture)
- [📁 Folder & File Management](#-folder--file-management)
- [🤝 File Sharing](#-file-sharing)
- [🗑️ Trash & Restore](#️-trash--restore)
- [🛡️ Security Architecture](#️-security-architecture)
- [🌐 AWS Infrastructure](#-aws-infrastructure)
- [⚖️ Load Balancer & Target Groups](#️-load-balancer--target-groups)
- [📈 Auto Scaling Architecture](#-auto-scaling-architecture)
- [🔒 HTTPS & Vercel Proxy](#-https--vercel-proxy)
- [🚀 Deployment Flow](#-deployment-flow)
- [🔁 Complete Request Lifecycle](#-complete-request-lifecycle)
- [🧯 Failure Scenarios](#-failure-scenarios)
- [📊 Why This Architecture?](#-why-this-architecture)
- [🧰 Technology Stack](#-technology-stack)
- [📂 Project Structure](#-project-structure)
- [🔌 API Surface](#-api-surface)
- [🧪 Local Development](#-local-development)
- [☁️ Production Deployment](#️-production-deployment)
- [💡 Engineering Decisions](#-engineering-decisions)
- [🛣️ Future Evolution](#️-future-evolution)
- [📚 What I Learned](#-what-i-learned)

---

# 🏗️ System Architecture

The deployed architecture is intentionally **simple enough to operate**, while still demonstrating real cloud infrastructure.

```mermaid
flowchart TB

    USER["👤 USER"]

    subgraph EDGE["🌍 EDGE / PRESENTATION"]
        VERCEL["▲ Vercel<br/>React + Vite"]
        PROXY["🔀 Vercel API Proxy"]
    end

    subgraph AWS["☁️ AWS — ap-south-1"]
        ALB["⚖️ Application Load Balancer<br/>vault-alb"]

        subgraph ASG["📈 Auto Scaling Group<br/>vault-backend-asg"]
            EC1["🖥️ EC2 Instance<br/>Node.js + Express + PM2"]
            EC2["🖥️ EC2 Instance<br/>scale-out capacity"]
        end

        TG["🎯 Target Group<br/>vault-backend-tg"]

        subgraph DATA["💾 DATA LAYER"]
            S3["🪣 Amazon S3<br/>Object Storage"]
            DB["🐘 PostgreSQL<br/>Metadata"]
            REDIS["⚡ Redis<br/>Fast / Temporary State"]
        end
    end

    USER --> VERCEL
    VERCEL --> PROXY
    PROXY --> ALB
    ALB --> TG
    TG --> EC1
    TG --> EC2

    EC1 --> S3
    EC1 --> DB
    EC1 --> REDIS

    EC2 --> S3
    EC2 --> DB
    EC2 --> REDIS

    style USER fill:#111827,color:#fff
    style VERCEL fill:#000,color:#fff
    style PROXY fill:#6C63FF,color:#fff
    style ALB fill:#FF9900,color:#111
    style EC1 fill:#232F3E,color:#fff
    style EC2 fill:#232F3E,color:#fff
    style TG fill:#FFB84D,color:#111
    style S3 fill:#569A31,color:#fff
    style DB fill:#4169E1,color:#fff
    style REDIS fill:#DC382D,color:#fff
```

> **Important:** the ASG/ALB infrastructure is part of the deployed architecture. The current operating capacity can be kept at one backend instance; the second instance represents the scale-out path rather than a requirement to keep two instances running continuously.

---

# 🗺️ Architecture at a Glance

```mermaid
flowchart LR

    A["Browser"] --> B["React"]
    B --> C["Vercel"]
    C --> D["API Proxy"]
    D --> E["ALB"]
    E --> F["Target Group"]
    F --> G["EC2"]

    G --> H["Express"]
    H --> I["Middleware"]
    I --> J["Routes"]
    J --> K["Controllers"]
    K --> L["Business Logic"]

    L --> M["Prisma"]
    M --> N["PostgreSQL"]

    L --> O["S3"]
    L --> P["Redis"]

    style A fill:#111827,color:#fff
    style B fill:#61DAFB,color:#000
    style C fill:#000,color:#fff
    style D fill:#6C63FF,color:#fff
    style E fill:#FF9900,color:#111
    style G fill:#232F3E,color:#fff
    style H fill:#339933,color:#fff
    style N fill:#4169E1,color:#fff
    style O fill:#569A31,color:#fff
    style P fill:#DC382D,color:#fff
```

---

# 🧱 Major Components

| Layer | Component | Responsibility |
|---|---|---|
| Presentation | React + Vite | UI, navigation, forms, file manager |
| Edge | Vercel | Frontend hosting + API proxy |
| Routing | ALB | Distribute HTTP traffic to backend targets |
| Compute | EC2 | Run Node.js backend |
| Process | PM2 | Keep backend process alive |
| Scaling | ASG | Maintain backend capacity |
| API | Express | REST API + middleware |
| Auth | JWT | Authentication |
| Metadata | PostgreSQL | Users, files, folders, permissions, state |
| ORM | Prisma | Type-safe database access |
| Temporary state | Redis | Fast operational/cache/session state |
| Blob storage | S3 | Actual file objects |

---

# ⚛️ Frontend Architecture

```mermaid
flowchart TB

    B["🌐 Browser"]

    subgraph REACT["⚛️ React Application"]
        ROUTER["Router"]
        PAGES["Pages / Screens"]
        COMPONENTS["Reusable Components"]
        SERVICES["services/api.js"]
        AUTH["Auth State"]
        STORAGE["localStorage<br/>vault_token"]
    end

    B --> ROUTER
    ROUTER --> PAGES
    PAGES --> COMPONENTS

    COMPONENTS --> SERVICES
    SERVICES --> AUTH
    AUTH --> STORAGE

    SERVICES -->|"Axios"| PROXY["▲ Vercel Proxy"]
    PROXY --> ALB["⚖️ AWS ALB"]

    style B fill:#111827,color:#fff
    style REACT fill:#EAFBFF,stroke:#61DAFB
    style SERVICES fill:#6C63FF,color:#fff
    style STORAGE fill:#F59E0B,color:#111
    style PROXY fill:#000,color:#fff
    style ALB fill:#FF9900,color:#111
```

### API client pattern

Production:

```text
React
  │
  ├── /auth/...
  ├── /files/...
  ├── /uploads/...
  ├── /users/...
  └── /api/folders/...
           │
           ▼
      Vercel Rewrite
           │
           ▼
          ALB
```

Development:

```text
React
   │
   ▼
http://localhost:5000
```

---

# 🧠 Backend Architecture

The backend follows a modular Express architecture.

```mermaid
flowchart TB

    REQ["HTTP Request"]

    CORS["CORS Middleware"]
    JSON["JSON Parser"]
    RATE["Rate Limiter"]
    AUTH["JWT / Auth Middleware"]
    ROUTE["Route"]

    CTRL["Controller"]
    SERVICE["Business Logic"]
    PRISMA["Prisma Client"]
    DB["PostgreSQL"]
    S3["Amazon S3"]
    REDIS["Redis"]

    ERR["Global Error Handler"]
    RES["HTTP Response"]

    REQ --> CORS
    CORS --> JSON
    JSON --> RATE
    RATE --> AUTH
    AUTH --> ROUTE
    ROUTE --> CTRL
    CTRL --> SERVICE

    SERVICE --> PRISMA
    PRISMA --> DB

    SERVICE --> S3
    SERVICE --> REDIS

    CTRL --> ERR
    SERVICE --> ERR
    ERR --> RES
    DB --> RES
    S3 --> RES

    style REQ fill:#111827,color:#fff
    style CORS fill:#6C63FF,color:#fff
    style RATE fill:#F59E0B,color:#111
    style AUTH fill:#EF4444,color:#fff
    style ROUTE fill:#339933,color:#fff
    style CTRL fill:#10B981,color:#fff
    style SERVICE fill:#14B8A6,color:#fff
    style PRISMA fill:#2D3748,color:#fff
    style DB fill:#4169E1,color:#fff
    style S3 fill:#569A31,color:#fff
    style REDIS fill:#DC382D,color:#fff
    style ERR fill:#7F1D1D,color:#fff
```

### Backend request philosophy

```text
REQUEST
   ↓
Validate
   ↓
Authenticate
   ↓
Authorize
   ↓
Execute business logic
   ↓
Persist / retrieve data
   ↓
Return structured response
```

---

# 🔐 Authentication Flow

```mermaid
sequenceDiagram
    autonumber

    actor U as User
    participant R as React
    participant A as Axios
    participant V as Vercel Proxy
    participant L as ALB
    participant E as Express
    participant DB as PostgreSQL

    U->>R: Submit signup/login
    R->>A: signupRequest()/loginRequest()
    A->>V: HTTPS request
    V->>L: Proxy request
    L->>E: Forward request
    E->>DB: Find/create user
    DB-->>E: User record
    E-->>L: JWT response
    L-->>V: Response
    V-->>A: Response
    A-->>R: Authentication result
    R->>R: Store vault_token
```

### Authenticated request

```mermaid
sequenceDiagram
    autonumber

    actor U as User
    participant R as React
    participant A as Axios
    participant E as Express
    participant JWT as JWT Middleware
    participant API as Protected Route

    U->>R: Perform protected action
    R->>A: API request
    A->>A: Read vault_token
    A->>A: Add Authorization header
    A->>E: Bearer JWT
    E->>JWT: Verify token
    JWT->>JWT: Extract user identity
    JWT->>API: Continue request
    API-->>R: Authorized response
```

---

# 📦 File Upload Architecture

Vault separates the **file transfer process** from **file metadata**.

```mermaid
flowchart TB

    FILE["📄 Large File"]

    INIT["1️⃣ Initialize Upload"]
    SESSION["Upload Session"]
    CHUNK["2️⃣ Upload Chunks"]
    PROGRESS["Track Chunk Progress"]
    COMPLETE["3️⃣ Complete Upload"]
    VALIDATE["Validate / Finalize"]
    S3["☁️ S3 Object"]
    META["🗄️ File Metadata"]
    REDIS["⚡ Redis"]

    FILE --> INIT
    INIT --> SESSION
    SESSION --> CHUNK
    CHUNK --> PROGRESS
    PROGRESS --> REDIS
    CHUNK --> COMPLETE
    COMPLETE --> VALIDATE
    VALIDATE --> S3
    VALIDATE --> META

    style FILE fill:#111827,color:#fff
    style INIT fill:#6C63FF,color:#fff
    style SESSION fill:#8B5CF6,color:#fff
    style CHUNK fill:#F59E0B,color:#111
    style PROGRESS fill:#DC382D,color:#fff
    style COMPLETE fill:#10B981,color:#fff
    style VALIDATE fill:#14B8A6,color:#fff
    style S3 fill:#569A31,color:#fff
    style META fill:#4169E1,color:#fff
    style REDIS fill:#DC382D,color:#fff
```

---

# 🔄 Resumable Chunk Upload

The key idea:

> **A large file is transferred as independently addressable pieces rather than relying on one giant request.**

```mermaid
sequenceDiagram
    autonumber

    actor U as User
    participant R as React
    participant API as Upload API
    participant REDIS as Redis
    participant S3 as S3
    participant DB as PostgreSQL

    U->>R: Select large file

    R->>API: POST /uploads/init
    API->>REDIS: Create upload state
    API-->>R: uploadId + upload information

    loop For each chunk
        R->>API: POST /uploads/{uploadId}/chunk
        API->>API: Validate chunk
        API->>S3: Store/process chunk
        API->>REDIS: Mark chunk completed
        API-->>R: Chunk accepted
    end

    R->>API: GET /uploads/{uploadId}/status
    API->>REDIS: Read completed chunks
    REDIS-->>API: Progress state
    API-->>R: Resume status

    R->>API: POST /uploads/{uploadId}/complete
    API->>S3: Finalize object
    API->>DB: Persist file metadata
    API->>REDIS: Clear upload session
    API-->>R: Upload complete
```

### Why chunk uploads?

```mermaid
flowchart LR

    BAD["❌ One giant request"]
    BAD --> FAIL["Network failure"]
    FAIL --> RESTART["Restart entire transfer"]

    GOOD["✅ Chunked upload"]
    GOOD --> C1["Chunk 1"]
    GOOD --> C2["Chunk 2"]
    GOOD --> C3["Chunk 3"]
    GOOD --> CN["Chunk N"]

    C2 --> FAIL2["Failure"]
    FAIL2 --> RESUME["Resume from missing chunk"]

    style BAD fill:#7F1D1D,color:#fff
    style GOOD fill:#065F46,color:#fff
    style RESUME fill:#10B981,color:#fff
```

---

# ☁️ S3 Storage Architecture

The system deliberately avoids treating PostgreSQL as the binary storage layer.

```mermaid
flowchart TB

    API["Express Backend"]

    META["PostgreSQL<br/><br/>fileId<br/>name<br/>size<br/>owner<br/>folder<br/>hash<br/>status"]

    OBJECT["Amazon S3<br/><br/>Actual bytes<br/>PDF / PNG / ZIP / video / etc."]

    API --> META
    API --> OBJECT

    META -. "references object" .-> OBJECT

    style API fill:#339933,color:#fff
    style META fill:#4169E1,color:#fff
    style OBJECT fill:#569A31,color:#fff
```

### Why this separation?

```text
                 FILE
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
     Metadata             Bytes
          │                │
          ▼                ▼
   PostgreSQL              S3
```

**PostgreSQL is optimized for structured relational data.**

**S3 is optimized for durable object storage.**

---

# 🗄️ Metadata Architecture

Think of PostgreSQL as the system's **index / source of truth for file relationships and application state**.

```mermaid
erDiagram

    USER ||--o{ FILE : owns
    USER ||--o{ FOLDER : owns
    USER ||--o{ SHARE : receives
    FOLDER ||--o{ FILE : contains
    FOLDER ||--o{ FOLDER : contains
    FILE ||--o{ SHARE : shared_as

    USER {
        uuid id
        string email
        string passwordHash
        string role
    }

    FILE {
        uuid id
        string name
        bigint size
        string objectKey
        string checksum
        string status
        boolean starred
        boolean trashed
    }

    FOLDER {
        uuid id
        string name
        uuid parentId
        boolean starred
        boolean trashed
    }

    SHARE {
        uuid id
        uuid fileId
        uuid userId
        string permission
    }
```

> The exact schema can evolve as the project grows; this diagram describes the logical relationships rather than claiming a literal column-for-column schema.

---

# ⚡ Redis Architecture

Redis is used where **fast, short-lived state** is more appropriate than durable relational storage.

```mermaid
flowchart LR

    API["Express API"]

    REDIS["⚡ Redis"]

    UPLOAD["Upload Session"]
    PROGRESS["Chunk Progress"]
    CACHE["Cached Data"]
    RATE["Rate Limiting / Fast Counters"]
    LOCK["Temporary Coordination / Locks"]

    API --> REDIS

    REDIS --> UPLOAD
    REDIS --> PROGRESS
    REDIS --> CACHE
    REDIS --> RATE
    REDIS --> LOCK

    style API fill:#339933,color:#fff
    style REDIS fill:#DC382D,color:#fff
    style UPLOAD fill:#F59E0B,color:#111
    style PROGRESS fill:#F59E0B,color:#111
    style CACHE fill:#F59E0B,color:#111
    style RATE fill:#F59E0B,color:#111
    style LOCK fill:#F59E0B,color:#111
```

### Mental model

```text
PostgreSQL
    ↓
Durable application state

Redis
    ↓
Fast temporary operational state

S3
    ↓
Durable binary objects
```

---

# 📁 Folder & File Management

Vault supports a file-manager style hierarchy.

```mermaid
flowchart TB

    ROOT["📁 My Files"]

    ROOT --> P1["📁 Projects"]
    ROOT --> P2["📁 Resume"]
    ROOT --> F1["📄 resume.pdf"]
    ROOT --> F2["📦 project.zip"]

    P1 --> P11["📁 Distributed Storage"]
    P1 --> P12["📁 Portfolio"]
    P1 --> F3["📄 project-notes.pdf"]

    P11 --> F4["📦 backend.zip"]
    P11 --> F5["📄 architecture.pdf"]
    P11 --> F6["📝 README.md"]

    style ROOT fill:#6C63FF,color:#fff
    style P1 fill:#8B5CF6,color:#fff
    style P2 fill:#8B5CF6,color:#fff
    style P11 fill:#8B5CF6,color:#fff
    style P12 fill:#8B5CF6,color:#fff
```

Supported operations include:

```text
CREATE FOLDER
GET FOLDER
UPDATE FOLDER
MOVE FOLDER
STAR FOLDER
TRASH FOLDER
RESTORE FOLDER
DELETE FOLDER
```

---

# 🤝 File Sharing

```mermaid
flowchart LR

    OWNER["👤 Owner"]
    FILE["📄 File"]
    SHARE["🔐 Share Permission"]
    USER["👤 Other User"]

    OWNER --> FILE
    OWNER --> SHARE
    SHARE --> USER

    SHARE --> R["READ"]
    SHARE --> W["WRITE"]

    style OWNER fill:#111827,color:#fff
    style FILE fill:#6C63FF,color:#fff
    style SHARE fill:#F59E0B,color:#111
    style USER fill:#111827,color:#fff
```

Sharing is enforced at the API/business-logic layer so that access is not determined merely by knowing a file identifier.

---

# 🗑️ Trash & Restore

Vault uses a soft-delete style workflow for files/folders.

```mermaid
stateDiagram-v2

    [*] --> ACTIVE

    ACTIVE --> TRASHED: Trash
    TRASHED --> ACTIVE: Restore
    TRASHED --> DELETED: Permanent Delete

    ACTIVE --> STARRED: Star
    STARRED --> ACTIVE: Unstar

    state ACTIVE {
        [*] --> Available
    }

    state TRASHED {
        [*] --> Recoverable
    }

    state DELETED {
        [*] --> Removed
    }
```

This gives the application a safer UX than immediately destroying every user action.

---

# 🛡️ Security Architecture

```mermaid
flowchart TB

    CLIENT["🌐 Client"]

    HTTPS["🔒 HTTPS / Vercel"]
    CORS["CORS"]
    RATE["Rate Limiting"]
    JWT["JWT Authentication"]
    AUTHZ["Authorization / Ownership"]
    VALID["Request Validation"]
    DBSEC["Database Access"]
    S3SEC["S3 Access"]

    CLIENT --> HTTPS
    HTTPS --> CORS
    CORS --> RATE
    RATE --> JWT
    JWT --> AUTHZ
    AUTHZ --> VALID
    VALID --> DBSEC
    VALID --> S3SEC

    style CLIENT fill:#111827,color:#fff
    style HTTPS fill:#10B981,color:#fff
    style CORS fill:#6C63FF,color:#fff
    style RATE fill:#F59E0B,color:#111
    style JWT fill:#EF4444,color:#fff
    style AUTHZ fill:#DC2626,color:#fff
    style VALID fill:#14B8A6,color:#fff
    style DBSEC fill:#4169E1,color:#fff
    style S3SEC fill:#569A31,color:#fff
```

### Security mechanisms

- JWT-based authentication
- Authorization checks
- CORS restrictions
- API rate limiting
- Environment-based secrets
- Controlled S3 access
- Checksum/integrity validation
- ALB-based production routing
- HTTPS at the public frontend boundary

---

# 🌐 AWS Infrastructure

The AWS deployment is organized around a VPC and multiple Availability Zones.

```mermaid
flowchart TB

    INTERNET["🌍 Internet"]

    subgraph VPC["☁️ AWS VPC"]
        subgraph AZ1["Availability Zone 1"]
            SUB1["Subnet"]
            EC1["EC2"]
        end

        subgraph AZ2["Availability Zone 2"]
            SUB2["Subnet"]
            EC2["EC2 / Scale-out target"]
        end

        ALB["⚖️ Application Load Balancer"]
        ASG["📈 Auto Scaling Group"]
    end

    INTERNET --> ALB
    ALB --> EC1
    ALB --> EC2
    ASG --> EC1
    ASG --> EC2

    style INTERNET fill:#111827,color:#fff
    style VPC fill:#F3F4F6,stroke:#6C63FF
    style ALB fill:#FF9900,color:#111
    style ASG fill:#6C63FF,color:#fff
    style EC1 fill:#232F3E,color:#fff
    style EC2 fill:#232F3E,color:#fff
```

---

# ⚖️ Load Balancer & Target Groups

```mermaid
flowchart LR

    CLIENT["Client"]
    ALB["⚖️ ALB<br/>vault-alb"]
    TG["🎯 Target Group<br/>vault-backend-tg"]

    T1["EC2 #1<br/>:5000"]
    T2["EC2 #2<br/>:5000"]

    CLIENT --> ALB
    ALB --> TG
    TG --> T1
    TG --> T2

    HC["❤️ Health Checks"]

    HC -.-> T1
    HC -.-> T2

    style CLIENT fill:#111827,color:#fff
    style ALB fill:#FF9900,color:#111
    style TG fill:#F59E0B,color:#111
    style T1 fill:#232F3E,color:#fff
    style T2 fill:#232F3E,color:#fff
    style HC fill:#10B981,color:#fff
```

The target group health checks determine whether a backend instance is healthy enough to receive traffic.

---

# 📈 Auto Scaling Architecture

```mermaid
flowchart TB

    ASG["📈 vault-backend-asg"]

    DESIRED["Desired Capacity = 1"]
    MIN["Minimum = 1"]
    MAX["Maximum = configurable"]

    TEMPLATE["📋 Launch Template<br/>vault-backend-template"]

    EC1["🖥️ EC2 #1"]
    EC2["🖥️ EC2 #2<br/>scale-out"]

    ASG --> DESIRED
    ASG --> MIN
    ASG --> MAX
    ASG --> TEMPLATE

    TEMPLATE --> EC1
    TEMPLATE -. "when scaling" .-> EC2

    style ASG fill:#6C63FF,color:#fff
    style DESIRED fill:#8B5CF6,color:#fff
    style MIN fill:#8B5CF6,color:#fff
    style MAX fill:#8B5CF6,color:#fff
    style TEMPLATE fill:#F59E0B,color:#111
    style EC1 fill:#232F3E,color:#fff
    style EC2 fill:#232F3E,color:#fff
```

### Why ASG?

Without ASG:

```text
EC2 dies
   ↓
Backend dies
   ↓
Manual recovery
```

With ASG:

```text
EC2 unhealthy
   ↓
ASG detects capacity/health issue
   ↓
New instance can be launched
   ↓
Launch Template provides configuration
   ↓
Target Group health check
   ↓
Traffic returns to healthy capacity
```

---

# 🔒 HTTPS & Vercel Proxy

A key production issue was the browser's **mixed-content restriction**.

The browser loads:

```text
https://vault-frontend-beryl.vercel.app
```

but the original API endpoint was HTTP.

That creates:

```mermaid
flowchart LR

    B["Browser"]
    V["HTTPS Vercel"]
    H["HTTP ALB"]

    B --> V
    V -. "❌ browser blocks insecure request" .-> H

    style B fill:#111827,color:#fff
    style V fill:#000,color:#fff
    style H fill:#FF9900,color:#111
```

The solution was a server-side Vercel rewrite/proxy:

```mermaid
flowchart LR

    B["🌐 Browser"]
    V["▲ Vercel<br/>HTTPS"]
    P["🔀 Server-side Rewrite"]
    A["⚖️ HTTP ALB"]
    E["🖥️ EC2"]

    B -->|"HTTPS"| V
    V --> P
    P -->|"Server-side request"| A
    A --> E

    style B fill:#111827,color:#fff
    style V fill:#000,color:#fff
    style P fill:#6C63FF,color:#fff
    style A fill:#FF9900,color:#111
    style E fill:#232F3E,color:#fff
```

### Why this works

The browser only sees:

```text
Browser
   ↓
HTTPS
Vercel
```

The backend hop happens through the Vercel server-side rewrite rather than as an insecure browser XHR.

---

# 🚀 Deployment Flow

```mermaid
flowchart TB

    DEV["👨‍💻 Local Development"]

    GIT["Git"]
    GH["GitHub"]

    VERCEL["▲ Vercel"]
    AWS["☁️ AWS"]

    FRONT["React Production Build"]
    ALB["ALB"]
    ASG["ASG"]
    EC["EC2"]
    PM2["PM2"]
    API["Node / Express"]

    DEV --> GIT
    GIT --> GH

    GH --> VERCEL
    VERCEL --> FRONT

    GH --> AWS
    AWS --> ASG
    ASG --> EC
    EC --> PM2
    PM2 --> API
    API --> ALB

    style DEV fill:#111827,color:#fff
    style GIT fill:#F59E0B,color:#111
    style GH fill:#181717,color:#fff
    style VERCEL fill:#000,color:#fff
    style AWS fill:#FF9900,color:#111
    style ASG fill:#6C63FF,color:#fff
    style EC fill:#232F3E,color:#fff
    style PM2 fill:#2B2B2B,color:#fff
    style API fill:#339933,color:#fff
```

---

# 🔁 Complete Request Lifecycle

## Example: `GET /files`

```mermaid
sequenceDiagram
    autonumber

    actor U as User
    participant R as React
    participant V as Vercel
    participant A as ALB
    participant E as Express
    participant J as JWT Middleware
    participant C as Controller
    participant P as Prisma
    participant DB as PostgreSQL

    U->>R: Open My Files
    R->>V: GET /files
    V->>A: Proxy request
    A->>E: Forward request
    E->>J: Verify JWT
    J->>C: Authorized request
    C->>P: Query files
    P->>DB: SELECT metadata
    DB-->>P: File records
    P-->>C: Records
    C-->>E: JSON response
    E-->>A: JSON
    A-->>V: JSON
    V-->>R: JSON
    R-->>U: Render file list
```

---

# 🧯 Failure Scenarios

## What if an upload chunk fails?

```mermaid
flowchart TD

    START["Upload Chunk"] --> FAIL{"Chunk accepted?"}

    FAIL -->|"Yes"| NEXT["Continue"]
    FAIL -->|"No"| RETRY["Retry chunk"]

    RETRY --> FAIL

    NEXT --> COMPLETE{"All chunks complete?"}

    COMPLETE -->|"No"| STATUS["Resume status"]
    STATUS --> NEXT

    COMPLETE -->|"Yes"| FINAL["Finalize upload"]

    style START fill:#6C63FF,color:#fff
    style FAIL fill:#F59E0B,color:#111
    style RETRY fill:#EF4444,color:#fff
    style FINAL fill:#10B981,color:#fff
```

## What if an EC2 instance becomes unhealthy?

```mermaid
flowchart TD

    EC["EC2 Instance"]
    HC["Target Group Health Check"]
    BAD["Unhealthy"]
    ASG["Auto Scaling Group"]
    LT["Launch Template"]
    NEW["New EC2"]
    TG["Target Group"]
    TRAFFIC["Traffic"]

    EC --> HC
    HC --> BAD
    BAD --> ASG
    ASG --> LT
    LT --> NEW
    NEW --> TG
    TG --> TRAFFIC

    style EC fill:#232F3E,color:#fff
    style HC fill:#10B981,color:#fff
    style BAD fill:#EF4444,color:#fff
    style ASG fill:#6C63FF,color:#fff
    style LT fill:#F59E0B,color:#111
    style NEW fill:#232F3E,color:#fff
    style TG fill:#FF9900,color:#111
```

## What if Redis is unavailable?

```text
Redis failure
     │
     ├── Temporary upload state may be affected
     │
     ├── Active resumable sessions may need recovery logic
     │
     └── Durable file metadata should remain in PostgreSQL
```

This separation is one reason Redis should not be treated as the permanent source of truth for user files.

---

# 📊 Why This Architecture?

## Why S3 instead of PostgreSQL for files?

```text
PostgreSQL
└── Relational / structured metadata

S3
└── Large binary objects
```

S3 is a natural object-storage layer, while PostgreSQL remains focused on relational application state.

---

## Why PostgreSQL?

Because the application has relationships:

```text
User
  ↓
Files
  ↓
Folders
  ↓
Permissions
  ↓
Shares
```

A relational database makes these relationships queryable and consistent.

---

## Why Redis?

Because some data is:

```text
FAST
TEMPORARY
HIGH-FREQUENCY
```

Examples include upload progress and short-lived operational state.

---

## Why ALB?

```text
Without ALB

Internet
   ↓
EC2
```

```text
With ALB

Internet
   ↓
ALB
   ↓
Healthy Targets
```

The ALB gives the backend a stable entry point and works naturally with target groups and Auto Scaling.

---

## Why ASG?

ASG turns:

```text
"I have one EC2 server"
```

into:

```text
"I have managed backend capacity"
```

It can replace unhealthy instances and scale according to configured capacity/scaling policies.

---

# 🧰 Technology Stack

### Frontend

- React
- Vite
- Axios
- React Router

### Backend

- Node.js
- Express.js
- JWT
- CORS
- Rate limiting
- PM2

### Data

- PostgreSQL
- Prisma
- Redis

### Storage

- Amazon S3

### AWS Infrastructure

- Amazon EC2
- Application Load Balancer
- Target Groups
- Auto Scaling Groups
- Launch Templates
- VPC / Subnets
- Security Groups
- AMI

### Deployment

- GitHub
- Vercel
- AWS

---

# 📂 Project Structure

A simplified view of the repository:

```text
distributed-file-storage-system/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   └── ...
│   ├── public/
│   ├── vercel.json
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── ...
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── package.json
│   └── ...
│
└── README.md
```

---

# 🔌 API Surface

## Authentication

```http
POST /auth/signup
POST /auth/login
GET  /auth/profile
```

## Users

```http
GET /users/search?q=<query>
```

## Files

```http
GET    /files
GET    /files/:id
DELETE /files/:id
GET    /files/:id/download

PATCH  /files/:id
PATCH  /files/:id/move
PATCH  /files/:id/star
PATCH  /files/:id/trash
PATCH  /files/:id/restore
```

## Sharing

```http
POST   /files/:id/share
GET    /files/shared-with-me
GET    /files/:id/shares
DELETE /files/:id/share/:userId
PATCH  /files/:id/share/:userId
```

## Special listings / batch operations

```http
GET  /files/starred
GET  /files/trashed
POST /files/batch-delete
POST /files/batch-move
```

## Folders

```http
GET    /api/folders
GET    /api/folders/:id
POST   /api/folders
PATCH  /api/folders/:id
PATCH  /api/folders/:id/move
PATCH  /api/folders/:id/star
PATCH  /api/folders/:id/trash
PATCH  /api/folders/:id/restore
DELETE /api/folders/:id
```

## Chunked uploads

```http
POST /uploads/init
POST /uploads/:uploadId/chunk
POST /uploads/:uploadId/complete
GET  /uploads/:uploadId/status
```

---

# 🧪 Local Development

## 1. Clone

```bash
git clone https://github.com/pratik3847/distributed-file-storage-system.git
cd distributed-file-storage-system
```

## 2. Backend

```bash
cd backend
npm install
```

Configure environment variables for:

```text
DATABASE_URL
JWT_SECRET
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET
REDIS_URL
PORT
```

Then:

```bash
npm run dev
```

## 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Local frontend:

```text
http://localhost:5173
```

---

# ☁️ Production Deployment

```mermaid
flowchart LR

    CODE["GitHub"]

    CODE --> FE["Vercel"]
    CODE --> BE["AWS EC2"]

    FE --> LIVE["Live React App"]
    BE --> PM2["PM2"]
    PM2 --> API["Express API"]

    API --> ALB["ALB"]
    API --> DB["PostgreSQL"]
    API --> REDIS["Redis"]
    API --> S3["S3"]

    style CODE fill:#181717,color:#fff
    style FE fill:#000,color:#fff
    style BE fill:#FF9900,color:#111
    style PM2 fill:#2B2B2B,color:#fff
    style API fill:#339933,color:#fff
    style ALB fill:#FF9900,color:#111
    style DB fill:#4169E1,color:#fff
    style REDIS fill:#DC382D,color:#fff
    style S3 fill:#569A31,color:#fff
```

### Live frontend

**https://vault-frontend-beryl.vercel.app/**

---

# 💡 Engineering Decisions

### 1. Separate metadata from blobs

```text
Metadata → PostgreSQL
Blobs    → S3
```

### 2. Use chunked uploads

```text
Large file
    ↓
Smaller transfer units
    ↓
Resume / retry
```

### 3. Keep authentication at the API layer

```text
JWT
 ↓
Middleware
 ↓
Identity
 ↓
Authorization
```

### 4. Put the ALB in front of backend compute

```text
Stable public endpoint
        ↓
Healthy targets
```

### 5. Use ASG for managed capacity

```text
Launch Template
       ↓
ASG
       ↓
EC2
```

### 6. Keep the frontend independent

```text
Vercel
   ↓
React deployment

AWS
   ↓
Backend infrastructure
```

This makes frontend delivery independent from backend infrastructure.

---

# 🧠 The Most Important Mental Model

If you remember only one diagram, remember this:

```mermaid
flowchart TB

    USER["👤 USER"]

    UI["⚛️ React / Vercel"]

    EDGE["🔀 Vercel Proxy"]

    LB["⚖️ ALB"]

    COMPUTE["🖥️ EC2<br/>Node + Express + PM2"]

    LOGIC["🧠 Business Logic"]

    DB["🐘 PostgreSQL<br/>Metadata"]

    CACHE["⚡ Redis<br/>Temporary State"]

    BLOB["🪣 S3<br/>File Bytes"]

    USER --> UI
    UI --> EDGE
    EDGE --> LB
    LB --> COMPUTE
    COMPUTE --> LOGIC

    LOGIC --> DB
    LOGIC --> CACHE
    LOGIC --> BLOB

    style USER fill:#111827,color:#fff
    style UI fill:#61DAFB,color:#000
    style EDGE fill:#6C63FF,color:#fff
    style LB fill:#FF9900,color:#111
    style COMPUTE fill:#232F3E,color:#fff
    style LOGIC fill:#10B981,color:#fff
    style DB fill:#4169E1,color:#fff
    style CACHE fill:#DC382D,color:#fff
    style BLOB fill:#569A31,color:#fff
```

---

# 🎯 Resume-Level Summary

> **Vault is a distributed cloud file storage platform that separates binary object storage from relational metadata, supports resumable chunked uploads, JWT-secured file operations, folder organization, sharing and soft-delete workflows, and is deployed using a Vercel-hosted React frontend backed by Node.js/Express running on AWS EC2 behind an Application Load Balancer and Auto Scaling Group, with PostgreSQL, Redis, and Amazon S3 forming the data layer.**

---

# 🛣️ Future Evolution

The original architectural roadmap explored a larger evolution toward event-driven microservices, Kafka, device synchronization, an API gateway, Docker, and additional AWS-managed infrastructure.

Those components are **future architectural directions, not claims about the currently deployed implementation**.

```mermaid
flowchart LR

    CURRENT["🚀 CURRENT VAULT"]

    CURRENT --> KAFKA["Kafka / Event Bus"]
    KAFKA --> SYNC["Sync Service"]
    CURRENT --> GATEWAY["Dedicated API Gateway"]
    CURRENT --> DOCKER["Containerization"]
    CURRENT --> OBS["Advanced Observability"]

    SYNC --> DEVICES["💻 Laptop<br/>📱 Phone<br/>📟 Tablet"]

    style CURRENT fill:#10B981,color:#fff
    style KAFKA fill:#231F20,color:#fff
    style SYNC fill:#6C63FF,color:#fff
    style GATEWAY fill:#FF9900,color:#111
    style DOCKER fill:#2496ED,color:#fff
    style OBS fill:#8B5CF6,color:#fff
    style DEVICES fill:#111827,color:#fff
```

---

# 📚 What I Learned Building Vault

This project is intentionally more than a CRUD application.

It combines:

```text
Frontend Engineering
        +
REST API Design
        +
Authentication
        +
Relational Data Modeling
        +
Object Storage
        +
Chunked File Transfer
        +
Caching / Temporary State
        +
Cloud Networking
        +
Load Balancing
        +
Auto Scaling
        +
Production Deployment
```

The biggest lesson:

> **Distributed systems are not created by adding more servers. They are created by deciding where state, computation, storage, traffic, and failure boundaries belong.**

---

# ⭐ Project Status

```text
██████████████████████████████████████████████████  DEPLOYED

Frontend       ██████████████████████████████████  ✅
REST API       ██████████████████████████████████  ✅
JWT Auth       ██████████████████████████████████  ✅
PostgreSQL     ██████████████████████████████████  ✅
Prisma         ██████████████████████████████████  ✅
S3 Storage     ██████████████████████████████████  ✅
Redis          ██████████████████████████████████  ✅
Chunk Upload   ██████████████████████████████████  ✅
File Sharing   ██████████████████████████████████  ✅
Folders        ██████████████████████████████████  ✅
AWS EC2        ██████████████████████████████████  ✅
ALB            ██████████████████████████████████  ✅
ASG            ██████████████████████████████████  ✅
Vercel         ██████████████████████████████████  ✅
```

---

<p align="center">

### ☁️ Built as a serious systems project.

**Vault — store it. organize it. share it.**

<br/>

<a href="https://vault-frontend-beryl.vercel.app/">
  <strong>🚀 OPEN VAULT LIVE DEMO →</strong>
</a>

</p>
