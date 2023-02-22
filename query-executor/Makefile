CFLAGS = -std=c++20 -lstdc++ -g -O0 -Wall -I/usr/local/include/hsql -L/usr/local/lib -lsqlparser
CXX = g++

# find cpp files in subdirectories
SOURCES := $(shell find . -name '*.cpp')

# find headers
HEADERS := $(shell find . -name '*.hpp')

OUTPUT := example

all: $(OUTPUT)

# The output depends on sources and headers
$(OUTPUT): $(SOURCES) $(HEADERS)
	$(CXX) $(CFLAGS) -o $(OUTPUT) $(SOURCES)

clean:
	$(RM) $(OUTPUT)

# all:
# 	$(CXX) $(CFLAGS) src/example.cpp -o example -lsqlparser