pipeline {
    agent any

    environment {
        IMAGE_NAME = 'medtrack-api'
        IMAGE_TAG = '1.0'
    }

    stages {
        stage('Build') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
            }
        }

        stage('Test') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }
    }
}
