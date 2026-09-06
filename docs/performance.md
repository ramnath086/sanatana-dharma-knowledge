# Performance

Phase 12 moved editorial route code into a lazy Vite chunk. Before the split, the main JavaScript asset was about 529 kB. After the split, the public entry is about 484 kB and the editorial chunk is about 36 kB before gzip.

Public routes do not eagerly import editorial dashboards or editorial generated datasets. The public bundle still includes the shared React application shell and public compiled data. Measure the current output with `npm run bundle-audit`.
