/**
 * Melaka Integration Tests - Firestore i18n Operations
 *
 * Tests the core i18n subcollection read/write operations.
 * Requires Firebase Emulator to be running.
 *
 * Run with: FIRESTORE_EMULATOR_HOST=localhost:8080 pnpm vitest run test/integration
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';

// Skip tests if emulator is not running
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST;
const describeIntegration = EMULATOR_HOST ? describe : describe.skip;

describeIntegration('Firestore i18n Operations', () => {
  let admin: typeof import('firebase-admin');
  let db: FirebaseFirestore.Firestore;

  beforeAll(async () => {
    // Dynamically import firebase-admin
    admin = await import('firebase-admin');

    // Initialize with emulator
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: 'melaka-test',
      });
    }

    db = admin.firestore();
  });

  afterEach(async () => {
    // Clean up test data
    const collections = ['test_articles', 'test_products'];
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      if (snapshot.docs.length > 0) {
        await batch.commit();
      }
    }
  });

  it('should create i18n subcollection for translated document', async () => {
    // Create source document
    const docRef = await db.collection('test_articles').add({
      title: 'Hello World',
      content: 'This is a test article.',
    });

    // Write translation to i18n subcollection
    const i18nRef = docRef.collection('i18n').doc('ms-MY');
    await i18nRef.set({
      title: 'Halo Dunia',
      content: 'Ini adalah artikel ujian.',
      _melaka: {
        status: 'translated',
        source_hash: 'abc123',
        translated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    // Verify translation was saved
    const i18nDoc = await i18nRef.get();
    expect(i18nDoc.exists).toBe(true);
    expect(i18nDoc.data()?.title).toBe('Halo Dunia');
    expect(i18nDoc.data()?._melaka.status).toBe('translated');
  });

  it('should read translations from i18n subcollection', async () => {
    // Create document with translations
    const docRef = await db.collection('test_articles').add({
      title: 'Test',
    });

    // Add multiple translations
    await docRef.collection('i18n').doc('ms-MY').set({
      title: 'Ujian',
      _melaka: { status: 'translated' },
    });

    await docRef.collection('i18n').doc('zh-CN').set({
      title: '测试',
      _melaka: { status: 'translated' },
    });

    // Read all translations
    const i18nSnapshot = await docRef.collection('i18n').get();
    expect(i18nSnapshot.size).toBe(2);

    const locales = i18nSnapshot.docs.map((doc) => doc.id);
    expect(locales).toContain('ms-MY');
    expect(locales).toContain('zh-CN');
  });

  it('should track translation status in metadata', async () => {
    const docRef = await db.collection('test_articles').add({
      title: 'Status Test',
    });

    // Initial: pending
    const i18nRef = docRef.collection('i18n').doc('ms-MY');
    await i18nRef.set({
      _melaka: { status: 'pending' },
    });

    let doc = await i18nRef.get();
    expect(doc.data()?._melaka.status).toBe('pending');

    // After translation: translated
    await i18nRef.update({
      title: 'Ujian Status',
      '_melaka.status': 'translated',
      '_melaka.source_hash': 'xyz789',
    });

    doc = await i18nRef.get();
    expect(doc.data()?._melaka.status).toBe('translated');
    expect(doc.data()?.title).toBe('Ujian Status');
  });

  it('should track failed translations with error message', async () => {
    const docRef = await db.collection('test_articles').add({
      title: 'Fail Test',
    });

    const i18nRef = docRef.collection('i18n').doc('ms-MY');
    await i18nRef.set({
      _melaka: {
        status: 'failed',
        error: 'Rate limit exceeded',
        translated_at: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    const doc = await i18nRef.get();
    expect(doc.data()?._melaka.status).toBe('failed');
    expect(doc.data()?._melaka.error).toBe('Rate limit exceeded');
  });

  it('should detect changed content via hash comparison', async () => {
    const docRef = await db.collection('test_articles').add({
      title: 'Original Title',
    });

    const originalHash = 'hash_v1';
    const i18nRef = docRef.collection('i18n').doc('ms-MY');

    // Save translation with hash
    await i18nRef.set({
      title: 'Tajuk Asal',
      _melaka: {
        status: 'translated',
        source_hash: originalHash,
      },
    });

    // Simulate checking if content changed
    const newHash = 'hash_v2';
    const doc = await i18nRef.get();
    const storedHash = doc.data()?._melaka.source_hash;

    expect(storedHash).toBe(originalHash);
    expect(storedHash !== newHash).toBe(true); // Content changed
  });

  it('should handle nested document references', async () => {
    // Create referenced document
    const authorRef = await db.collection('test_authors').add({
      name: 'John Doe',
    });

    // Create document with reference
    const docRef = await db.collection('test_articles').add({
      title: 'Article with Author',
      author: authorRef,
    });

    // Translation should preserve reference
    const i18nRef = docRef.collection('i18n').doc('ms-MY');
    await i18nRef.set({
      title: 'Artikel dengan Pengarang',
      author: authorRef, // Reference should be preserved
      _melaka: { status: 'translated' },
    });

    const doc = await i18nRef.get();
    expect(doc.data()?.author.path).toBe(authorRef.path);

    // Cleanup author
    await authorRef.delete();
  });

  it('should handle batch translation writes', async () => {
    const docRef = await db.collection('test_articles').add({
      title: 'Batch Test',
    });

    const batch = db.batch();
    const locales = ['ms-MY', 'zh-CN', 'ta-IN'];

    for (const locale of locales) {
      const i18nRef = docRef.collection('i18n').doc(locale);
      batch.set(i18nRef, {
        title: `Translated for ${locale}`,
        _melaka: {
          status: 'translated',
          source_hash: 'batch_hash',
        },
      });
    }

    await batch.commit();

    // Verify all translations were written
    const i18nSnapshot = await docRef.collection('i18n').get();
    expect(i18nSnapshot.size).toBe(3);
  });
});
