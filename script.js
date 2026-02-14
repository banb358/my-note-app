class NoteApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.activeNoteId = null;

        // DOM Elements
        this.noteList = document.getElementById('note-list');
        this.titleInput = document.getElementById('note-title');
        this.bodyInput = document.getElementById('note-body');
        this.createdDate = document.getElementById('created-date');
        this.searchInput = document.getElementById('search-input');
        this.newNoteBtn = document.getElementById('new-note-btn');
        this.deleteNoteBtn = document.getElementById('delete-note-btn');
        this.backBtn = document.getElementById('mobile-back-btn');
        this.sidebar = document.querySelector('.sidebar');
        this.emptyState = document.getElementById('empty-state');
        this.mascotGreeting = document.getElementById('mascot-greeting');

        this.init();
    }

    init() {
        // Event Listeners
        this.newNoteBtn.addEventListener('click', () => this.createNewNote());
        this.deleteNoteBtn.addEventListener('click', () => this.deleteCurrentNote());
        this.titleInput.addEventListener('input', () => this.updateNote());
        this.bodyInput.addEventListener('input', () => this.updateNote());
        this.searchInput.addEventListener('input', (e) => this.filterNotes(e.target.value));
        this.backBtn.addEventListener('click', () => this.toggleSidebar(true));

        this.renderNoteList();
        this.updateMascotGreeting();

        // Select first note if available
        if (this.notes.length > 0) {
            this.selectNote(this.notes[0].id);
        } else {
            this.toggleEditorVisibility(false);
        }
    }

    createNewNote() {
        const newNote = {
            id: Date.now().toString(),
            title: '',
            body: '',
            updatedAt: new Date().toISOString()
        };

        this.notes.unshift(newNote);
        this.saveNotes();
        this.renderNoteList();
        this.selectNote(newNote.id);
        this.titleInput.focus();

        if (window.innerWidth <= 768) {
            this.toggleSidebar(false);
        }
    }

    selectNote(id) {
        this.activeNoteId = id;
        const note = this.notes.find(n => n.id === id);

        if (note) {
            this.titleInput.value = note.title;
            this.bodyInput.value = note.body;
            this.createdDate.textContent = new Date(note.updatedAt).toLocaleDateString('ja-JP', {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
            });
            this.toggleEditorVisibility(true);
        }

        this.renderNoteList();

        if (window.innerWidth <= 768) {
            this.toggleSidebar(false);
        }
    }

    updateNote() {
        const note = this.notes.find(n => n.id === this.activeNoteId);
        if (note) {
            note.title = this.titleInput.value;
            note.body = this.bodyInput.value;
            note.updatedAt = new Date().toISOString();

            this.saveNotes();
            this.renderNoteList(false); // Don't refresh icons every keystroke if possible
        }
    }

    deleteCurrentNote() {
        if (!this.activeNoteId) return;

        if (confirm('このノートを削除しますか？')) {
            this.notes = this.notes.filter(n => n.id !== this.activeNoteId);
            this.saveNotes();

            if (this.notes.length > 0) {
                this.selectNote(this.notes[0].id);
            } else {
                this.activeNoteId = null;
                this.toggleEditorVisibility(false);
            }
            this.renderNoteList();
        }
    }

    filterNotes(query) {
        this.renderNoteList(true, query);
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    renderNoteList(refreshIcons = true, filter = '') {
        const filteredNotes = this.notes.filter(n =>
            n.title.toLowerCase().includes(filter.toLowerCase()) ||
            n.body.toLowerCase().includes(filter.toLowerCase())
        );

        this.noteList.innerHTML = filteredNotes.map(note => `
            <div class="note-item ${note.id === this.activeNoteId ? 'active' : ''}" data-id="${note.id}">
                <div class="note-item-title">${note.title || '無題のノート'}</div>
                <div class="note-item-date">${new Date(note.updatedAt).toLocaleDateString('ja-JP')}</div>
            </div>
        `).join('');

        // Add click events to list items
        this.noteList.querySelectorAll('.note-item').forEach(item => {
            item.addEventListener('click', () => this.selectNote(item.dataset.id));
        });

        if (refreshIcons && window.lucide) {
            window.lucide.createIcons();
        }
    }

    toggleEditorVisibility(show) {
        document.querySelector('.editor-header').style.visibility = show ? 'visible' : 'hidden';
        document.querySelector('.editor-content').style.visibility = show ? 'visible' : 'hidden';
        if (this.emptyState) {
            this.emptyState.style.display = show ? 'none' : 'flex';
        }
    }

    toggleSidebar(show) {
        if (show) {
            this.sidebar.classList.remove('hidden');
        } else {
            this.sidebar.classList.add('hidden');
        }
    }

    updateMascotGreeting() {
        if (!this.mascotGreeting) return;

        const hour = new Date().getHours();
        let greeting = "Hello!";

        if (hour >= 5 && hour < 12) {
            greeting = "Good morning! / おはよう";
        } else if (hour >= 12 && hour < 18) {
            greeting = "Good afternoon! / こんにちは";
        } else {
            greeting = "Good evening! / こんばんは";
        }

        this.mascotGreeting.textContent = greeting;
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    new NoteApp();
});
