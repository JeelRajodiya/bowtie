from pathlib import Path

import nox

ROOT = Path(__file__).parent
DOCS = ROOT / "docs"
BOWTIE = ROOT / "bowtie"
TESTS = ROOT / "tests"


@nox.session(python=["3.8", "3.9", "3.10"])
def tests(session):
    session.install("-r", str(ROOT / "test-requirements.txt"))
    session.run("pytest")


@nox.session
def build(session):
    session.install("build")
    tmpdir = session.create_tmp()
    session.run("python", "-m", "build", str(ROOT), "--outdir", tmpdir)


@nox.session(tags=["style"])
def readme(session):
    session.install("build", "twine")
    tmpdir = session.create_tmp()
    session.run("python", "-m", "build", str(ROOT), "--outdir", tmpdir)
    session.run("python", "-m", "twine", "check", tmpdir + "/*")


@nox.session(tags=["style"])
def style(session):
    session.install(
        "flake8",
        "flake8-broken-line",
        "flake8-bugbear",
        "flake8-commas",
        "flake8-quotes",
        "flake8-tidy-imports",
    )
    session.run("python", "-m", "flake8", str(BOWTIE), str(TESTS))


@nox.session(tags=["docs"])
@nox.parametrize(
    "builder", [
        nox.param(name, id=name) for name in [
            "dirhtml", "doctest", "linkcheck", "spelling"
        ]
    ],
)
def docs(session, builder):
    session.install("-r", str(DOCS / "requirements.txt"))
    tmpdir = Path(session.create_tmp())
    argv = ["-n", "-T", "-W"]
    if builder != "spelling":
        argv += ["-q"]
    session.run(
        "python", "-m", "sphinx", "-b", builder,
        str(DOCS), str(tmpdir / builder), *argv,
    )


@nox.session(tags=["docs", "style"], name="docs(style)")
def docs_style(session):
    session.install(
        "doc8",
        "pygments",
        "pygments-github-lexers",
    )
    session.run("python", "-m", "doc8", str(DOCS))
