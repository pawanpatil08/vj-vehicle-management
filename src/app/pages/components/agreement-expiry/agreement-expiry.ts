import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FirebaseDataService } from '../../../services/firebase-data.service';
import { Resident } from '../../../model/resident.model';

interface ExpiryStatus {
  status: 'expired' | 'this-month' | 'next-month' | 'within-3-months' | 'upcoming';
  daysLeft: number;
  color: string;
}

@Component({
  selector: 'app-agreement-expiry',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './agreement-expiry.html',
  styleUrl: './agreement-expiry.scss',
})
export class AgreementExpiryComponent implements OnInit {
  firebaseDataService = inject(FirebaseDataService);

  loading = signal<boolean>(false);
  allResidents = signal<Resident[]>([]);
  expiringAgreements = computed(() => {
    return this.allResidents()
      .filter((r) => r.agreementExpiryDate)
      .map((r) => ({
        resident: r,
        status: this.calculateExpiryStatus(r.agreementExpiryDate),
      }))
      .filter((item) => item.status.status !== 'upcoming')
      .sort(
        (a, b) =>
          new Date(a.resident.agreementExpiryDate!).getTime() -
          new Date(b.resident.agreementExpiryDate!).getTime()
      );
  });

  ngOnInit() {
    this.loadResidents();
  }

  async loadResidents() {
    try {
      this.loading.set(true);
      const residents = await this.firebaseDataService.getResidents();
      
      // Add dummy data for demonstration
      const dummyResidents: Resident[] = [
        {
          id: 'dummy-1',
          flatNumber: 'A-101',
          occupiedBy: 'Owner',
          primaryName: 'Rajesh Kumar',
          primaryMobile: '9876543210',
          secondaryName: '',
          secondaryMobile: '',
          moveInDate: '',
          agreementExpiryDate: new Date(2026, 4, 15).toISOString().split('T')[0], // May 15 (this month)
          myGateReg: '',
          totalMembers: '3',
          members: [],
          vTotal2W: '1',
          vTotal4W: '1',
          vehicles: [],
          anyPets: 'NO',
          petType1: '',
          petType2: '',
          dateInserted: '',
          _all: '',
        },
        {
          id: 'dummy-2',
          flatNumber: 'B-202',
          occupiedBy: 'Tenant',
          primaryName: 'Priya Sharma',
          primaryMobile: '9123456789',
          secondaryName: '',
          secondaryMobile: '',
          moveInDate: '',
          agreementExpiryDate: new Date(2026, 5, 20).toISOString().split('T')[0], // June 20 (next month)
          myGateReg: '',
          totalMembers: '2',
          members: [],
          vTotal2W: '0',
          vTotal4W: '1',
          vehicles: [],
          anyPets: 'YES',
          petType1: 'Dog',
          petType2: '',
          dateInserted: '',
          _all: '',
        },
        {
          id: 'dummy-3',
          flatNumber: 'C-303',
          occupiedBy: 'Owner',
          primaryName: 'Amit Patel',
          primaryMobile: '8765432109',
          secondaryName: '',
          secondaryMobile: '',
          moveInDate: '',
          agreementExpiryDate: new Date(2026, 6, 10).toISOString().split('T')[0], // July 10 (within 3 months)
          myGateReg: '',
          totalMembers: '4',
          members: [],
          vTotal2W: '2',
          vTotal4W: '0',
          vehicles: [],
          anyPets: 'NO',
          petType1: '',
          petType2: '',
          dateInserted: '',
          _all: '',
        },
        {
          id: 'dummy-4',
          flatNumber: 'D-104',
          occupiedBy: 'Tenant',
          primaryName: 'Neha Singh',
          primaryMobile: '9987654321',
          secondaryName: '',
          secondaryMobile: '',
          moveInDate: '',
          agreementExpiryDate: new Date(2026, 4, 5).toISOString().split('T')[0], // May 5 (this month - expiring soon)
          myGateReg: '',
          totalMembers: '2',
          members: [],
          vTotal2W: '0',
          vTotal4W: '1',
          vehicles: [],
          anyPets: 'NO',
          petType1: '',
          petType2: '',
          dateInserted: '',
          _all: '',
        },
        {
          id: 'dummy-5',
          flatNumber: 'E-205',
          occupiedBy: 'Owner',
          primaryName: 'Vikram Gupta',
          primaryMobile: '7654321098',
          secondaryName: '',
          secondaryMobile: '',
          moveInDate: '',
          agreementExpiryDate: new Date(2026, 7, 25).toISOString().split('T')[0], // Aug 25 (within 3 months)
          myGateReg: '',
          totalMembers: '3',
          members: [],
          vTotal2W: '1',
          vTotal4W: '2',
          vehicles: [],
          anyPets: 'YES',
          petType1: 'Cat',
          petType2: '',
          dateInserted: '',
          _all: '',
        },
      ];

      // Combine real residents with dummy data
      const allResidents = [...residents, ...dummyResidents];
      this.allResidents.set(allResidents);
    } catch (error) {
      console.error('Error loading residents:', error);
    } finally {
      this.loading.set(false);
    }
  }

  calculateExpiryStatus(expiryDateStr: string | undefined): ExpiryStatus {
    if (!expiryDateStr) {
      return {
        status: 'upcoming',
        daysLeft: Infinity,
        color: '#9ca3af',
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(expiryDateStr);
    expiryDate.setHours(0, 0, 0, 0);

    const daysLeft = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) {
      return { status: 'expired', daysLeft, color: '#991b1b' };
    }

    const currentMonth = today.getMonth();
    const expiryMonth = expiryDate.getMonth();

    if (expiryMonth === currentMonth && expiryDate.getFullYear() === today.getFullYear()) {
      return { status: 'this-month', daysLeft, color: '#dc2626' };
    }

    const nextMonth = (currentMonth + 1) % 12;
    if (expiryMonth === nextMonth && expiryDate.getFullYear() === today.getFullYear()) {
      return { status: 'next-month', daysLeft, color: '#f59e0b' };
    }

    if (daysLeft <= 90) {
      return { status: 'within-3-months', daysLeft, color: '#fbbf24' };
    }

    return { status: 'upcoming', daysLeft, color: '#9ca3af' };
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      expired: 'Expired',
      'this-month': 'Expiring This Month',
      'next-month': 'Expiring Next Month',
      'within-3-months': 'Within 3 Months',
      upcoming: 'Upcoming',
    };
    return labels[status] || 'Upcoming';
  }
}
