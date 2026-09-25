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

        stage('Code Quality') {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=medtrack-api \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://host.docker.internal:9000 \
                        -Dsonar.login=$SONAR_TOKEN
                    '''
                }
            }
        }

        stage('Security') {
            steps {
                sh 'npm audit --audit-level=critical'
                sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --severity CRITICAL --exit-code 1 medtrack-api:1.0'
            }
        }

        stage('Release') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        rsync -av -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" --exclude 'node_modules' --exclude '.git' ./ ec2-user@54.253.181.6:~/medtrack-api/
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ec2-user@54.253.181.6 "pkill -f '[n]ode server.js' || true"
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ec2-user@54.253.181.6 "cd medtrack-api && npm install"
                        ssh -f -i $SSH_KEY -o StrictHostKeyChecking=no ec2-user@54.253.181.6 "cd medtrack-api && setsid nohup node server.js > app.log 2>&1 < /dev/null"
                    '''
                }
            }
        }
    }
}