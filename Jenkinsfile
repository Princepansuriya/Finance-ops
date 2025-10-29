pipeline {
    agent any

    environment {
        DOCKERHUB = "docker.io/<your-dockerhub-username>/cicd-app"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git credentialsId: 'github-cred', url: 'https://github.com/Princepansuriya/Finance-ops.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t $DOCKERHUB:latest ."
            }
        }

        stage('Push Image to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-cred', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push $DOCKERHUB:latest"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh "kubectl --kubeconfig=$KUBECONFIG apply -f k8s-deploy.yml"
                }
            }
        }
    }
}
