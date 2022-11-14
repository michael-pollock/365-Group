# 365-Group
CS365 Group Project

To start:

Make sure Node.js is installed on your system,
on WSL or Linux you would install linux like this 
    sudo apt-get install nodejs
To check run 
        npm --version 
        node --version

If you encounter errors when installing try the following commands, 
    sudo apt update && sudo apt upgrade

If all of this fails then we can download the latest version Linux 64 bit binaries
    [WSL]
        wget https://nodejs.org/dist/v18.12.1/node-v18.12.1-linux-x64.tar.xz
        tar -xf node-v18.12.1-linux-x64.tar.xz
        rm node-v18.12.1-linux-x64.tar.xz
        sudo cp -r ./* /usr/local/ # make sure that you are in the ~/node-v18.12.1-linux-x64

    To check run 
        npm --version 
        node --version



To install dependencies
    express npm install express
    socket.io npm install socket.io

