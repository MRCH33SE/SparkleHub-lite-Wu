package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"mokhan.ca/CodeChica/sparkleapi/pkg/web"
)

var (
	address string
	help    bool
)

func init() {
	flag.BoolVar(&help, "help", false, "")
	flag.StringVar(&address, "address", ":8080", "the address to bind to")
	flag.Parse()
}

func main() {
	if help == true {
		flag.Usage()
		os.Exit(0)
	} else {
		fmt.Printf("Listening and serving HTTP on `%s`\n", address)
		log.Fatal(http.ListenAndServe(address, web.NewServer(nil)))
	}
}
