import React, { useEffect, useState } from "react";
import "./App.css";

interface PollResponse {
  id: string;
  time: Number;
  text: string;
  question: string;
  response: string;
  isComplete: boolean;
}
function App() {
  const [query, setQuery] = useState<string>("");
  const [passage, setPassage] = useState<string>("");
  const [loading, setLoading] = useState<Boolean>(false);
  const [res, setResponse] = useState<PollResponse | undefined>(undefined);
  const [summary, setSummary] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      poll();
    }, 5_000);

    return () => clearInterval(interval);
  }, []);
  function doesHaveIdParam() {
    const params = new URL(window.location.href).searchParams;
    const id = params.get("id");
    console.log(id);
    if (id === null) {
      return false;
    }
    return true;
  }
  function poll() {
    const params = new URL(window.location.href).searchParams;
    const id = params.get("id");
    if (id !== null && summary.length < 10) {
      fetch(`https://quail-api.quinnpatwardhan.com/poll?id=${id}`)
        .then((r) => r.json())
        .then((r) => {
          if (r.error === undefined || !r.error) {
            if (r.isComplete) {
              setResponse(r);
              setSummary(r.response);
            }
          } else {
            console.log(r);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }
  function handleSubmit() {
    const opts = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        passage_input: passage,
        query_input: query,
      }),
    };
    fetch("https://quail-api.quinnpatwardhan.com/gen-summary", opts)
      .then((r) => r.json())
      .then((r) => {
        if (r.error === undefined || r.error) {
          alert("Unknown Error");
        } else {
          setLoading(true);
          window.location.href += `?id=${r.id}`;
        }
      })
      .catch((e) => {
        console.log(e);
        alert("Unknown Error");
      });
  }
  return (
    <div className="App">
      <div className="center">
        <h1>Quail</h1>
        <h3>Dual-LM, High-Accuracy Text Summarizer</h3>
        {!doesHaveIdParam() ? (
          <div className="form-wrapper">
            <input
              placeholder="Summarize Thomas Kuhn's Paradigm Idea, and how it relates to Natural Philosophy"
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              value={query}
            />
            <textarea
              placeholder="The need for drastic condensation has also forced me to forego discussion of a number of major problems. My distinction between the pre- and the post-paradigm periods in the development of a science is, for example, much too schematic. Each of the schools whose competition characterizes the earlier period is guided by something much like a paradigm; there are circumstances, though I think them rare, under which two paradigms can coexist peacefully in the later period. Mere possession of a paradigm is not quite a sufficient criterion for the developmental transition discussed in Section II. More important, ex..."
              onChange={(e) => {
                setPassage(e.target.value);
              }}
              value={passage}
            ></textarea>
            <button onClick={() => handleSubmit()}>Summarize</button>
          </div>
        ) : (
          <div className="form-wrapper">
            <textarea
              placeholder="Your Summary Will Be Here Soon..."
              readOnly={true}
              value={summary}
            ></textarea>
          </div>
        )}
        <div
          className="form-wrapper"
          style={{ marginTop: "1em", paddingBottom: "2em" }}
        >
          <h5>How It Works</h5>
          <p>
            First, we take the inputted passage, split it into individual
            sentences, and rank each sentence by relevance to the query using
            SentenceTransformers. We then take the top-n ranked sentences,
            combine them back into a new passage, and use FastChat-T5, a
            Text-To-Text Transfer Transformer Learning-based language model to
            summarize the passage. FastChat-T5 is based on Google's Flan XL T5
            Model. Quail is based on research conducted by Georgetown
            University's Infosense AI/ML/IR Research Lab, submitted to the 2023
            Run of TREC (the Text Retrieval Conference), hosted by the NIST
            (National Institute of Standards and Technology). See the paper:{" "}
            <a href="https://arxiv.org/abs/2311.09513">
              Sequencing Matters: A Generate-Retrieve-Generate Model for
              Building Conversational Agents
            </a>
            . Quail has the advantage of avoiding LLM Hallucinations when
            summarizing text, as it does less regeneration and more extraction.
            Georgetown's solution placed highly in the assessment of TREC-iKAT,
            placing second for passage retrieval results (out of 8 submitting
            institutions), 2nd for response quality, and 2nd for PTKB ranking.
          </p>
          <h5>Dependencies</h5>
          <ul>
            <li>
              <a href="https://www.sbert.net/">Sentence-Transformers</a>
            </li>
            <li>
              <a href="https://huggingface.co/lmsys/fastchat-t5-3b-v1.0">
                FastChat-T5
              </a>
            </li>
            <li>
              <a href="https://redis.io/">Redis</a>
            </li>
            <li>
              <a href="https://flask.palletsprojects.com/en/3.0.x">Flask</a>
            </li>
            <li>
              <a href="https://www.docker.com/">Docker</a>
            </li>
          </ul>
          <h5
            style={{
              textAlign: "center",
              fontSize: "1.5em",
              fontWeight: "100",
            }}
          >
            <a
              style={{ color: "black", fontStyle: "italic" }}
              href="quinnpatwardhan.com"
            >
              Made With ❤️ by Quinn Patwardhan
            </a>
          </h5>
        </div>
      </div>
    </div>
  );
}

export default App;
