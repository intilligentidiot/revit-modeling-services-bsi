class Pagination {
    constructor({ items, itemsPerPage, renderItem, listContainer, controlsContainer }) {
        this.items = items;
        this.itemsPerPage = itemsPerPage;
        this.renderItem = renderItem;
        this.listContainer = listContainer;
        this.controlsContainer = controlsContainer;
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
    }

    init() {
        this.renderPage(this.currentPage);
        this.renderControls();
    }

    renderPage(page) {
        this.currentPage = page;
        const start = (page - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = this.items.slice(start, end);

        this.listContainer.innerHTML = pageItems.map(this.renderItem).join('');
        this.renderControls(); // Re-render controls to update active state

        // Optional: Scroll to top of list container if needed
        // this.listContainer.scrollIntoView({ behavior: 'smooth' });
    }

    renderControls() {
        this.controlsContainer.innerHTML = '';

        if (this.totalPages <= 1) return;

        const nav = document.createElement('nav');
        nav.className = 'flex justify-center items-center space-x-2 mt-12';

        // Previous Button
        const prevBtn = this.createButton(
            '<i class="ph ph-caret-left"></i>',
            this.currentPage > 1,
            () => this.renderPage(this.currentPage - 1)
        );
        nav.appendChild(prevBtn);

        // Page Numbers
        for (let i = 1; i <= this.totalPages; i++) {
            // Logic to show limited pages if too many could go here, 
            // but for now simple 1..N
            const pageBtn = this.createButton(
                i,
                true,
                () => this.renderPage(i),
                i === this.currentPage
            );
            nav.appendChild(pageBtn);
        }

        // Next Button
        const nextBtn = this.createButton(
            '<i class="ph ph-caret-right"></i>',
            this.currentPage < this.totalPages,
            () => this.renderPage(this.currentPage + 1)
        );
        nav.appendChild(nextBtn);

        this.controlsContainer.appendChild(nav);
    }

    createButton(content, enabled, onClick, isActive = false) {
        const btn = document.createElement('button');
        btn.innerHTML = content;
        btn.disabled = !enabled;

        if (enabled) {
            btn.onclick = onClick;
        }

        const baseClasses = 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200';
        const activeClasses = 'bg-brand-accent text-white shadow-md transform scale-105';
        const inactiveClasses = 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-brand-accent hover:text-brand-accent';
        const disabledClasses = 'opacity-30 cursor-not-allowed bg-slate-50 text-slate-400 border border-slate-100';

        if (!enabled) {
            btn.className = `${baseClasses} ${disabledClasses}`;
        } else if (isActive) {
            btn.className = `${baseClasses} ${activeClasses}`;
        } else {
            btn.className = `${baseClasses} ${inactiveClasses}`;
        }

        return btn;
    }
}
