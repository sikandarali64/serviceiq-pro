class MockFirebase {
  constructor() {
    this.listeners = {};
    this.init();
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(...args));
    }
  }

  init() {
    const data = localStorage.getItem('serviceIqData_v4');
    if (data) {
      this.data = JSON.parse(data);
      // Migrate old data - ensure all workers have walletBalance
      let migrated = false;
      this.data.workers = this.data.workers.map(w => {
        if (w.walletBalance === undefined) {
          migrated = true;
          return { ...w, walletBalance: 500 };
        }
        return w;
      });
      // Ensure customers array exists
      if (!this.data.customers) {
        this.data.customers = [];
        migrated = true;
      }
      if (migrated) this.save();
    } else {
      this.seedData();
    }
  }

  seedData() {
    const workers = [
      { id: 'w1', name: 'Ali Hassan',      skill: 'electrician', rating: 4.9, isAvailable: true, feePaid: true, distance: 1.2, walletBalance: 500 },
      { id: 'w2', name: 'Ahmed Khan',      skill: 'plumber',      rating: 4.7, isAvailable: true, feePaid: true, distance: 3.4, walletBalance: 500 },
      { id: 'w3', name: 'Sara Malik',      skill: 'house_cleaning',      rating: 4.8, isAvailable: true, feePaid: true, distance: 2.1, walletBalance: 500 },
      { id: 'w4', name: 'Usman Ali',       skill: 'ac_repair',    rating: 4.6, isAvailable: true, feePaid: true, distance: 4.5, walletBalance: 500 },
      { id: 'w5', name: 'Fatima Sheikh',   skill: 'fridge_repair',  rating: 4.5, isAvailable: true, feePaid: true, distance: 2.8, walletBalance: 500 },
      { id: 'w6', name: 'Bilal Ahmed',     skill: 'sofa_cleaning',      rating: 4.9, isAvailable: true, feePaid: true, distance: 1.5, walletBalance: 500 },
      { id: 'w7', name: 'Zara Khan',       skill: 'curtain_cleaning',      rating: 4.7, isAvailable: true, feePaid: true, distance: 3.0, walletBalance: 500 },
      { id: 'w8', name: 'Tariq Mahmood',   skill: 'ac_repair',    rating: 4.8, isAvailable: true, feePaid: true, distance: 2.2, walletBalance: 500 },
    ];

    // Jobs: amountPaid=0 for customer (InDrive model — customer pays nothing to platform)
    // Job statuses: pending | assigned | arrived | completed | cancelled
    const jobs = [
      { id: 'j1', customerName: 'John D.',    serviceType: 'electrician', status: 'completed', workerId: 'w1', amountPaid: 0, commissionDeducted: 100, aiReasoning: 'Ali Hassan selected — 1.2km, electrician, rating 4.9', cancelledBy: null, workerArrived: true, createdAt: new Date().toISOString() },
      { id: 'j2', customerName: 'Emma W.',    serviceType: 'plumber',     status: 'completed', workerId: 'w2', amountPaid: 0, commissionDeducted: 100, aiReasoning: 'Ahmed Khan selected — 3.4km, plumber, rating 4.7',    cancelledBy: null, workerArrived: true, createdAt: new Date().toISOString() },
      { id: 'j3', customerName: 'Michael S.', serviceType: 'house_cleaning',     status: 'completed', workerId: 'w3', amountPaid: 0, commissionDeducted: 100, aiReasoning: 'Sara Malik selected — 2.1km, house cleaning, rating 4.8',    cancelledBy: null, workerArrived: true, createdAt: new Date().toISOString() },
      { id: 'j4', customerName: 'Sarah K.',   serviceType: 'ac_repair',   status: 'cancelled', workerId: 'w4', amountPaid: 0, commissionDeducted: 0,   aiReasoning: 'Usman Ali selected — 4.5km, ac repair, rating 4.6',   cancelledBy: 'customer', workerArrived: true, createdAt: new Date().toISOString() },
      { id: 'j5', customerName: 'David L.',   serviceType: 'fridge_repair', status: 'assigned',  workerId: 'w5', amountPaid: 0, commissionDeducted: 0,   aiReasoning: 'Fatima Sheikh selected — 2.8km, fridge repair, rating 4.5', cancelledBy: null, workerArrived: false, createdAt: new Date().toISOString() },
      { id: 'j6', customerName: 'Alice P.',   serviceType: 'sofa_cleaning',     status: 'assigned',  workerId: 'w6', amountPaid: 0, commissionDeducted: 0,   aiReasoning: 'Bilal Ahmed selected — 1.5km, sofa cleaning, rating 4.9',    cancelledBy: null, workerArrived: false, createdAt: new Date().toISOString() },
    ];

    // Customer profiles with warning tracking
    const customers = [
      { id: 'c4', name: 'Sarah K.', warnings: 1, phone: '0300-0000004', blockedUntil: null },
    ];

    this.data = { workers, jobs, customers };
    this.save();
  }

  save() {
    localStorage.setItem('serviceIqData_v4', JSON.stringify(this.data));
    this.emit('update');
  }

  getWorkers() { return this.data.workers; }
  getJobs()    { return this.data.jobs; }
  getCustomers() { return this.data.customers || []; }

  addWorker(worker) {
    const newWorker = { ...worker, id: 'w' + Date.now() };
    this.data.workers.push(newWorker);
    this.save();
    return newWorker;
  }

  updateWorker(id, updates) {
    this.data.workers = this.data.workers.map(w => w.id === id ? { ...w, ...updates } : w);
    this.save();
  }

  addJob(job) {
    const newJob = {
      ...job,
      id: 'j' + Date.now(),
      amountPaid: 0,         // InDrive model: customer pays nothing to platform
      commissionDeducted: 0,
      cancelledBy: null,
      workerArrived: false,
      createdAt: new Date().toISOString()
    };
    this.data.jobs.push(newJob);
    this.save();
    return newJob;
  }

  updateJob(id, updates) {
    this.data.jobs = this.data.jobs.map(j => j.id === id ? { ...j, ...updates } : j);
    this.save();
  }

  // Warn a customer — if warnings >= 3, block them temporarily
  warnCustomer(customerName, phone = '') {
    if (!this.data.customers) this.data.customers = [];
    const existing = this.data.customers.find(c => c.name === customerName);
    if (existing) {
      const newWarnings = (existing.warnings || 0) + 1;
      const blocked = newWarnings >= 3 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null;
      this.data.customers = this.data.customers.map(c =>
        c.name === customerName ? { ...c, warnings: newWarnings, blockedUntil: blocked } : c
      );
    } else {
      this.data.customers.push({
        id: 'c' + Date.now(),
        name: customerName,
        phone,
        warnings: 1,
        blockedUntil: null
      });
    }
    this.save();
    return this.data.customers.find(c => c.name === customerName);
  }

  getCustomerWarnings(customerName) {
    if (!this.data.customers) return 0;
    const c = this.data.customers.find(c => c.name === customerName);
    return c ? (c.warnings || 0) : 0;
  }

  subscribe(callback) {
    this.on('update', callback);
    return () => this.off('update', callback);
  }
}

export const db = new MockFirebase();
