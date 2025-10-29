pipeline {
    agent any

    parameters {
        string(name: 'GIT_REPO', defaultValue: 'https://github.com/Princepansuriya/Finance-ops.git', description: 'Git repository URL')
        string(name: 'BRANCH', defaultValue: 'main', description: 'Branch to build')
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

