pipeline {
    agent any

    environment {
        IMAGE_NAME = "prince2003pansuriya/cicd-app:latest"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/Princepansuriya/Finance-ops.git', branch: 'main', credentialsId: 'github-cred'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Push Image to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh """
                        echo "$PASSWORD" | docker login -u "$USERNAME" --password-stdin
                        docker push ${IMAGE_NAME}
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    kubectl apply -f k8s-deploy.yml
                    kubectl rollout restart deployment cicd-app-deployment
                """
            }
        }

    }
}

