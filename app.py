import os

from flask import Flask, abort, redirect, render_template, request, session, url_for


FINAL_CODE = "3147928450"
FINAL_FLAG = "ADROIT{old_web_never_forgets}"

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "adroit-local-training-key")


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/archives/")
def archives():
    return render_template("archives.html")


@app.route("/archives/counter")
def counter():
    return render_template("counter.html")


@app.route("/club/")
def club():
    return render_template("club.html")


@app.route("/downloads/mirror-2")
def mirror():
    return render_template("mirror.html")


@app.route("/term-inal/", methods=["GET", "POST"])
def terminal():
    error = None
    if request.method == "POST":
        submitted_code = request.form.get("code", "").strip()
        if submitted_code == FINAL_CODE:
            session["solved"] = True
            return redirect(url_for("success"))
        error = "ACCESS DENIED: code rejected. Check the archive fragments and their order."
    return render_template("terminal.html", error=error)


@app.route("/term-inal/success")
def success():
    if not session.get("solved"):
        return redirect(url_for("terminal"))
    return render_template("success.html", flag=FINAL_FLAG)


@app.route("/human-check/")
def human_check():
    return render_template("human_check.html")


@app.route("/dead-end/")
def dead_end():
    return render_template("dead_end.html")


@app.route("/rickroll/")
def rickroll():
    return redirect("https://youtu.be/dQw4w9WgXcQ", code=302)


@app.route("/old-files/<path:filename>")
def old_files(filename):
    abort(404)


@app.errorhandler(404)
def not_found(_error):
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)