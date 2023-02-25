...

## Setup the API
### Download and install library `pq`
`sudo dnf install libpq-devel`
### Download and install library `pqxx`
1. Download the respective library source code from github (https://github.com/jtv/libpqxx) - we used version 7.7.1. (the most recent version 7.7.4. was not working with the `--enable-shared` from the step 2.)
2. run `./configure --enable-shared`
3. run `make && make install`