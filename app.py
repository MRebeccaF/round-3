import os

from flask import Flask, abort, redirect, render_template, request, session, url_for


FINAL_FLAG = "ADROIT{old_web_never_forgets}"
FINAL_KEY = "ADROITMOUSETRAIL"
FRAGMENT_PATHS = (
    "/archives/counter",
    "/club/",
    "/downloads/mirror-2",
    "/old-files/club-2009-roster.txt",
)
RELAY_NODE_PATHS = (
    "/archives/relay/east",
    "/archives/relay/north",
    "/archives/relay/west",
    "/archives/relay/south",
    "/archives/relay/central",
    "/archives/relay/library",
    "/archives/relay/lab",
    "/archives/relay/modem",
)
CODEBOOK_SHELF_PATHS = (
    "/archives/codebook/east",
    "/archives/codebook/north",
    "/archives/codebook/south",
    "/archives/codebook/west",
    "/archives/codebook/library",
    "/archives/codebook/central",
    "/archives/codebook/lab",
    "/archives/codebook/modem",
)
RELAY_NODES = {
    "north": {"name": "North repeater", "received": "14:05", "delay": "29 minutes", "tile": "3"},
    "east": {"name": "East repeater", "received": "13:50", "delay": "17 minutes", "tile": "4"},
    "south": {"name": "South repeater", "received": "14:22", "delay": "41 minutes", "tile": "1"},
    "west": {"name": "West repeater", "received": "13:57", "delay": "18 minutes", "tile": "6"},
    "central": {"name": "Central repeater", "received": "14:11", "delay": "27 minutes", "tile": "9"},
    "library": {"name": "Library repeater", "received": "14:00", "delay": "14 minutes", "tile": "0"},
    "lab": {"name": "Lab repeater", "received": "14:18", "delay": "29 minutes", "tile": "2"},
    "modem": {"name": "Modem repeater", "received": "14:39", "delay": "47 minutes", "tile": "7"},
}
CODEBOOK_SHELVES = {
    "east": {"name": "East shelf card", "checked_out": "14 March 2009", "coordinates": "11 12"},
    "north": {"name": "North shelf card", "checked_out": "16 March 2009", "coordinates": "13 14"},
    "south": {"name": "South shelf card", "checked_out": "18 March 2009", "coordinates": "15 21"},
    "west": {"name": "West shelf card", "checked_out": "20 March 2009", "coordinates": "31 14"},
    "library": {"name": "Library shelf card", "checked_out": "22 March 2009", "coordinates": "24 34"},
    "central": {"name": "Central shelf card", "checked_out": "24 March 2009", "coordinates": "35 21"},
    "lab": {"name": "Lab shelf card", "checked_out": "26 March 2009", "coordinates": "13 11"},
    "modem": {"name": "Modem shelf card", "checked_out": "28 March 2009", "coordinates": "15 23"},
}


def recovery_code():
    """Build the terminal code using the archive's overlapping-tile protocol."""
    fragments = ("314", "479", "928", "845")
    recovered = fragments[0]
    for fragment in fragments[1:]:
        if fragment[0] != recovered[-1]:
            raise ValueError("Archive fragments do not form a continuous recovery chain.")
        recovered += fragment[1:]
    return f"{recovered}{sum(int(digit) for digit in recovered) % 10}"


ARCHIVE_CODE = recovery_code()


def relay_code():
    """Build the final relay code from its transmission-order tiles."""
    recovered = "".join(
        RELAY_NODES[direction]["tile"]
        for direction in ("east", "north", "west", "south", "central", "library", "lab", "modem")
    )
    return f"{recovered}{sum(int(digit) for digit in recovered):02d}"


FINAL_CODE = relay_code()

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
    mark_fragment_found("/archives/counter")
    return render_template("counter.html")


@app.route("/club/")
def club():
    mark_fragment_found("/club/")
    return render_template("club.html")


@app.route("/downloads/mirror-2")
def mirror():
    mark_fragment_found("/downloads/mirror-2")
    return render_template("mirror.html")


@app.route("/old-files/club-2009-roster.txt")
def roster_backup():
    mark_fragment_found("/old-files/club-2009-roster.txt")
    return render_template("roster_backup.html")


@app.route("/term-inal/", methods=["GET", "POST"])
def terminal():
    error = None
    if request.method == "POST":
        submitted_code = request.form.get("code", "").strip()
        if not has_all_fragments():
            error = "ACCESS LOCKED: recover all four archive fragments before submitting a code."
        elif submitted_code == ARCHIVE_CODE:
            session["stage_one_solved"] = True
            return redirect(url_for("success"))
        else:
            error = "ACCESS DENIED: code rejected. Recheck the overlap chain and checksum."
    return render_template("terminal.html", error=error)


@app.route("/term-inal/success")
def success():
    if not session.get("stage_one_solved"):
        return redirect(url_for("terminal"))
    if session.get("final_solved"):
        return redirect(url_for("complete"))
    return render_template("stage_one.html")


@app.route("/archives/packet-log", methods=["GET", "POST"])
def packet_log():
    if not session.get("stage_one_solved"):
        return redirect(url_for("terminal"))

    error = None
    if request.method == "POST":
        submitted_key = request.form.get("packet_key", "").strip().upper()
        if submitted_key == "RELAY":
            session["packet_decoded"] = True
            return redirect(url_for("relay"))
        error = "PACKET REJECTED: the log entry has not been decoded correctly."
    return render_template("packet_log.html", error=error)


@app.route("/archives/relay/")
def relay():
    if not session.get("packet_decoded"):
        return redirect(url_for("packet_log"))
    return render_template("relay.html")


@app.route("/archives/relay/<node>")
def relay_node(node):
    if not session.get("packet_decoded"):
        return redirect(url_for("packet_log"))
    node_data = RELAY_NODES.get(node)
    if node_data is None:
        abort(404)
    mark_relay_node_found(f"/archives/relay/{node}")
    return render_template("relay_node.html", node=node_data)


@app.route("/term-inal/relay", methods=["GET", "POST"])
def relay_terminal():
    if not session.get("packet_decoded"):
        return redirect(url_for("packet_log"))

    error = None
    if request.method == "POST":
        submitted_code = request.form.get("code", "").strip()
        if not has_all_relay_nodes():
            error = "RELAY LOCKED: inspect all eight repeaters before submitting a code."
        elif submitted_code == FINAL_CODE:
            session["relay_solved"] = True
            return redirect(url_for("codebook"))
        else:
            error = "RELAY REJECTED: recheck transmission order and the two-digit checksum."
    return render_template("relay_terminal.html", error=error)


@app.route("/term-inal/complete")
def complete():
    if not session.get("final_solved"):
        return redirect(url_for("terminal"))
    return render_template("success.html", flag=FINAL_FLAG)


@app.route("/archives/codebook/")
def codebook():
    if not session.get("relay_solved"):
        return redirect(url_for("relay_terminal"))
    return render_template("codebook.html")


@app.route("/archives/codebook/<shelf>")
def codebook_shelf(shelf):
    if not session.get("relay_solved"):
        return redirect(url_for("relay_terminal"))
    shelf_data = CODEBOOK_SHELVES.get(shelf)
    if shelf_data is None:
        abort(404)
    mark_codebook_shelf_found(f"/archives/codebook/{shelf}")
    return render_template("codebook_shelf.html", shelf=shelf_data)


@app.route("/term-inal/final", methods=["GET", "POST"])
def final_terminal():
    if not session.get("relay_solved"):
        return redirect(url_for("relay_terminal"))

    error = None
    if request.method == "POST":
        submitted_key = request.form.get("key", "").strip().upper()
        if not has_all_codebook_shelves():
            error = "CODEBOOK LOCKED: inspect all eight shelf cards before submitting a key."
        elif submitted_key == FINAL_KEY:
            session["final_solved"] = True
            return redirect(url_for("complete"))
        else:
            error = "CODEBOOK REJECTED: recheck shelf order and grid coordinates."
    return render_template("final_terminal.html", error=error)


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


def mark_fragment_found(path):
    found = set(session.get("archive_fragments", ()))
    found.add(path)
    session["archive_fragments"] = sorted(found)


def has_all_fragments():
    return set(FRAGMENT_PATHS).issubset(session.get("archive_fragments", ()))


def mark_relay_node_found(path):
    found = set(session.get("relay_nodes", ()))
    found.add(path)
    session["relay_nodes"] = sorted(found)


def has_all_relay_nodes():
    return set(RELAY_NODE_PATHS).issubset(session.get("relay_nodes", ()))


def mark_codebook_shelf_found(path):
    found = set(session.get("codebook_shelves", ()))
    found.add(path)
    session["codebook_shelves"] = sorted(found)


def has_all_codebook_shelves():
    return set(CODEBOOK_SHELF_PATHS).issubset(session.get("codebook_shelves", ()))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
