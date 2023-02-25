###
###
###
### For debugging purposes
###
###
###

CFLAGS = -std=c++20 -lstdc++ -g -O0 -Wall -I/usr/local/include/hsql -L/usr/local/lib -lsqlparser
LDFLAGS = -lpqxx -lpq

CXX = g++

# find cpp files in subdirectories
SOURCES := $(shell find . -wholename './src/core/*.cpp')

# find headers
HEADERS := $(shell find . -wholename './src/core/*.hpp')

OUTPUT := example

all: $(OUTPUT)

$(OUTPUT): $(SOURCES) $(HEADERS)
	$(CXX) $(CFLAGS) -o $(OUTPUT) $(SOURCES) $(LDFLAGS)

clean:
	$(RM) $(OUTPUT)
