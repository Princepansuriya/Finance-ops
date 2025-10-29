# CI/CD Pipeline with Jenkins, Docker, and Kubernetes

This project implements a fully automated CI/CD pipeline using **Jenkins**, **DockerHub**, and a **Kubernetes cluster**. The application is built from a GitHub repository, containerized, pushed to DockerHub, and deployed to Kubernetes automatically upon new code commits.

---

## 🚀 CI/CD Workflow (High-Level Diagram)


This pipeline performs:

- ✅ Code Checkout
- ✅ Docker Image Build
- ✅ Push to DockerHub Registry
- ✅ Kubernetes Deployment

1: Jenkins Groovy Pipeline Script (Jenkinsfile)

pipeline {
    agent any

    parameters {
        string(name: 'GIT_REPO', defaultValue: 'https://github.com/Princepansuriya/Finance-ops.git', description: 'Git repository URL')
        string(name: 'BRANCH', defaultValue: 'main', description: 'Branch to checkout and build')
        string(name: 'IMAGE_NAME', defaultValue: 'prince2003pansuriya/cicd-app', description: 'Docker image name')
        string(name: 'DEPLOYMENT_NAME', defaultValue: 'cicd-app', description: 'Kubernetes Deployment name')
        string(name: 'K8S_FILE', defaultValue: 'k8s-deploy.yml', description: 'Kubernetes manifest file')
    }

    stages {

        stage('Checkout Code') {
            steps {
                git url: params.GIT_REPO, branch: params.BRANCH, credentialsId: 'github-cred'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${params.IMAGE_NAME}:latest ."
            }
        }

        stage('Push Image to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh """
                        echo "$PASSWORD" | docker login -u "$USERNAME" --password-stdin
                        docker push ${params.IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh """
                        export KUBECONFIG=$KUBECONFIG_FILE
                        kubectl apply -f ${params.K8S_FILE}
                        kubectl rollout restart deployment ${params.DEPLOYMENT_NAME}
                    """
                }
            }
        }
    }
}


2: Full Documentation
  1. Objective
    The goal is to create a CI/CD pipeline that:
    Automatically triggers when code is pushed to GitHub
    Builds a Docker image
    Pushes it to DockerHub
    Deploys it to a Kubernetes cluster

  
  2. Prerequisites
    | Requirement        | Description                 |
    | ------------------ | --------------------------- |
    | Jenkins            | Installed & Running         |
    | Docker             | Installed and Logged in     |
    | Kubernetes Cluster | Minikube / Kind / EKS etc.  |
    | DockerHub Account  | To store application images |
    | GitHub Repository  | Source code + Jenkinsfile   |

  3. Configure GitHub Webhook
     GitHub does not accept http://localhost:8080
     So we use ngrok to expose Jenkins to public.

     Step 1: Start ngrok on Jenkins port
     ngrok http 8080
     
     Step 2: Copy the generated public URL
     https://ferial-cheryll-pseudoangularly.ngrok-free.dev
     
     Step 3: Add Webhook in GitHub
     Go to:
      GitHub → Repo → Settings → Webhooks → Add Webhook
     
        | Field        | Value                                 |
        | ------------ | ------------------------------------- |
        | Payload URL  | `https://<ngrok-url>/github-webhook/` |
        | Content Type | `application/json`                    |
        | Trigger      | Just **Push events**                  |
     
     Note: ngrok URL changes when you stop ngrok.
    | Solution | Use ngrok reserved domain (paid) OR do not close ngrok terminal while testing. |

  4. Jenkins Credentials Setup
     | Credential ID | Type                | Usage                     |
     | ------------- | ------------------- | ------------------------- |
     | github-cred   | Username + PAT      | Pull private repo         |
     | dockerhub     | Username + Password | Push Docker image         |
     | kubeconfig    | Secret File         | Access Kubernetes cluster |

     Upload kubeconfig:
     cat ~/.kube/config
        Copy > Save in Jenkins as kubeconfig

  5. Kubernetes Deployment File (k8s-deploy.yml)
             apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: cicd-app
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: cicd-app
      template:
        metadata:
          labels:
            app: cicd-app
        spec:
          containers:
          - name: cicd-app
            image: prince2003pansuriya/cicd-app:latest
            ports:
            - containerPort: 80

3: Test Cases & Validation

| Test Case                 | What to Check             | Expected Result                 |
| ------------------------- | ------------------------- | ------------------------------- |
| Push new commit to GitHub | Webhook → Jenkins Trigger | Pipeline starts automatically   |
| Build Stage               | Docker builds image       | Successful build logs           |
| Push Stage                | DockerHub repository      | Image appears with `latest` tag |
| Deploy Stage              | Run: `kubectl get pods`   | New pod version deployed        |
| Logs                      | Run: `kubectl logs <pod>` | Application responds correctly  |

Simple Monitoring Implementation

  1) Kubernetes Pod Health Check Command
     kubectl get deployments
     kubectl get pods -o wide
     
  2) Watch Pod Status Live
     kubectl get pods -w

  3)Check Kubernetes Logs
    kubectl logs -f deployment/cicd-app
  

## CI/CD Architecture Diagram

```mermaid
flowchart LR
A[Developer Pushes Code to GitHub] --> B[GitHub Webhook Triggers Jenkins]
B --> C[Jenkins Pipeline]
C --> D[Build Docker Image]
D --> E[Push Image to DockerHub]
E --> F[Deploy to Kubernetes Cluster]
F --> G[Application Running in Pods]


## Troubleshooting
| Issue | Possible Cause | Solution |
|------|---------------|----------|
| Jenkins build not triggered | Webhook not configured correctly | Re-check GitHub → Webhooks → Delivery Logs |
| Docker push fails | Wrong DockerHub credentials | Update credentials in Jenkins → Manage Credentials |
| Kubernetes deploy fails | kubeconfig missing/incorrect | Re-upload ~/.kube/config in Jenkins with ID `kubeconfig` |
| Pods not updating | Image cached in cluster | Run `kubectl rollout restart deployment cicd-app` |


project-root/
└── assets/
    ├── dockerhub-latest.png
    ├── Jenkins Credentials.png
    ├── pipeline-success.png
    ├── pods-running.png
    └── Webhook.png


  
