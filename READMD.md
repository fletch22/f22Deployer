### How to Deploy       


Step: Start Montreal Vagrant.

Step : Run 

    npm run b
    npm start
    
    # Ubuntu Build/Deploy will start.
    
Step : When finished, test website.

Step : Stop the f22website.

Step : SSH to Vagrant's Guest.

Step : Navigate to /vagrant/workspaces/docker/docker-compose

Step : Execute:

    ./dc-clean.sh # This removes old f22website container associated with Docker Compose script (not the one we just built in previous step.)
    
Step : Execute:

    ./dns-redirect.sh # This will redirect all DNS queries on most(?) interfaces on port 53, to Consult's port 53. Consult then performs the resolution. 
    
Step : Execute:

    ./dc.sh # This starts Docker Compose.