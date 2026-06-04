import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="StudyBridge",
    page_icon="🎓",
    layout="wide",
)

# Hide all Streamlit chrome
st.markdown("""
    <style>
        .stApp > header { display: none !important; }
        .stApp { margin: 0 !important; padding: 0 !important; }
        .block-container { padding: 0 !important; max-width: 100% !important; }
        [data-testid="stToolbar"] { display: none !important; }
        [data-testid="stDecoration"] { display: none !important; }
        [data-testid="stStatusWidget"] { display: none !important; }
        footer { display: none !important; }
        iframe { border: none !important; }
    </style>
""", unsafe_allow_html=True)

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Inject auto-resize script — reports real page height to Streamlit parent
resize_script = """
<script>
(function() {
  function reportHeight() {
    var h = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    window.parent.postMessage({ isStreamlitMessage: true, type: "streamlit:setFrameHeight", height: h }, "*");
  }
  window.addEventListener("load", function() {
    reportHeight();
    setInterval(reportHeight, 300);
    new MutationObserver(reportHeight).observe(document.body, { subtree: true, childList: true, attributes: true });
  });
})();
</script>
"""
html = html.replace("</body>", resize_script + "\n</body>")

components.html(html, height=12000, scrolling=False)
