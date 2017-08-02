package main

import (
    "github.com/julienschmidt/httprouter"
    "net/http"
    "html/template"
    "strconv"
    "flag"
    "fmt"
    "io/ioutil"
)

func MainGetHandle(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
    t,_ := template.ParseFiles("static/main.html")
    t.Execute(w, nil)
}

func CourseInfoHandle(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
    baseUrl := "http://www.uu.se/utbildning/utbildningar/selma/kursplan/"
    params := r.URL.Query()
    code := params.Get("code")
    url := baseUrl + "?kKod=" + code
    resp, _ := http.Get(url)
    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Printf(code + " done.\n")
    fmt.Fprintf(w, string(body))
}

func main() {
    // Instantiate a new router
    router := httprouter.New()

    // GET handler
    router.GET("/", MainGetHandle)
    router.GET("/api", CourseInfoHandle)
    router.ServeFiles("/static/*filepath", http.Dir("static"))

    // Parse flags
    var host = flag.String("host", "localhost", "Domain name of the place to host the service.")
    var port = flag.Int("port", 8080, "Port to serve http on.")
    flag.Parse()

    // Fire up the server
    http.ListenAndServe(*host + ":" + strconv.Itoa(*port), router)
}
