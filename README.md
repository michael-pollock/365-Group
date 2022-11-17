# 365-Group

CS365 Group Project

    To start:

    Make sure Node.js is installed on your system,
    on WSL or Linux you would install Nodejs like this
        sudo apt-get install nodejs
    To check run
        npm --version
        node --version

    If you encounter errors when installing try the following commands,
        sudo apt update && sudo apt upgrade

    If all of this fails then we can download the latest version Linux 64 bit binaries
        wget https://nodejs.org/dist/v18.12.1/node-v18.12.1-linux-x64.tar.xz
        tar -xf node-v18.12.1-linux-x64.tar.xz
        rm node-v18.12.1-linux-x64.tar.xz
        sudo cp -r ./* /usr/local/ # make sure that you are in the ~/node-v18.12.1-linux-x64

    To check run
        npm --version
        node --version

    To install dependencies
        npm install express
        npm install socket.io
        npm install --save-dev nodemon
        npm install dotenv --save


    To run the server
        npm run dev
    or
        nodemon server/server.js

    To ensure no conflicts in code i.e. overwriting someone elses code we must each have
    a separate branch aside from main one follow steps below

    To create a branch
        git checkout -b "your_new_branch_name"
    To switch between branches
        git checkout "your_branch_name"
    To push from separate branch in git
        git push --set-upstream origin "your_branch_name_here"
    To check what branch you are in and list branches
        git branch --list
