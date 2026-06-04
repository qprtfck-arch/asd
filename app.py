import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="StudyBridge",
    page_icon="🎓",
    layout="wide",
)

# Hide Streamlit UI chrome
st.markdown("""
    <style>
        #root > div:first-child { padding: 0; }
        .stApp > header { display: none; }
        .stApp { margin: 0; padding: 0; }
        .block-container { padding: 0 !important; max-width: 100% !important; }
        [data-testid="stToolbar"] { display: none; }
        [data-testid="stDecoration"] { display: none; }
        [data-testid="stStatusWidget"] { display: none; }
        footer { display: none; }
    </style>
""", unsafe_allow_html=True)

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

components.html(html, height=6000, scrolling=True)
