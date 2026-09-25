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

        stage('Release') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        rsync -av -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" --exclude 'node_modules' --exclude '.git' ./ ec2-user@54.253.181.6:~/medtrack-api/
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ec2-user@54.253.181.6 "cd medtrack-api && npm install && pkill -f 'node server.js' || true && nohup node server.js > app.log 2>&1 &"
                    '''
                }
            }
        }
    }
}