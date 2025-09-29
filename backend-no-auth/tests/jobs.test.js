const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Job = require("../models/jobModel");

const jobs = [
    {
        title: "Software Engineer",
        type: "Full-time",
        description: "Build and maintain backend services.",
        company: {
            name: "Helsinki Tech",
            contactEmail: "hr@helsinkitech.fi",
            contactPhone: "1234567890",
        },
    },
    {
        title: "Frontend Developer",
        type: "Contract",
        description: "Develop UI components and improve UX.",
        company: {
            name: "Nordic Web",
            contactEmail: "jobs@nordicweb.fi",
            contactPhone: "0987654321",
        },
    },
];

describe("Job Controller (non-protected)", () => {
    beforeEach(async () => {
        await Job.deleteMany({});
        await Job.insertMany(jobs);
    });

    afterAll(() => {
        mongoose.connection.close();
    });

    // GET /api/jobs
    it("should return all jobs as JSON when GET /api/jobs is called", async () => {
        const response = await api
            .get("/api/jobs")
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(response.body).toHaveLength(jobs.length);
    });

    // POST /api/jobs
    it("should create a new job when POST /api/jobs is called", async () => {
        const newJob = {
            title: "QA Engineer",
            type: "Full-time",
            description: "Design and execute test plans.",
            company: {
                name: "Quality Corp",
                contactEmail: "qa@qualitycorp.fi",
                contactPhone: "555111222",
            },
        };

        await api
            .post("/api/jobs")
            .send(newJob)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const jobsAfterPost = await Job.find({});
        expect(jobsAfterPost).toHaveLength(jobs.length + 1);
        const titles = jobsAfterPost.map((j) => j.title);
        expect(titles).toContain(newJob.title);
    });

    // GET /api/jobs/:id
    it("should return one job by ID when GET /api/jobs/:id is called", async () => {
        const job = await Job.findOne();
        await api
            .get(`/api/jobs/${job._id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    it("should return 404 for a non-existing job ID", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        await api.get(`/api/jobs/${nonExistentId}`).expect(404);
    });

    // PUT /api/jobs/:id
    it("should update one job with partial data when PUT /api/jobs/:id is called", async () => {
        const job = await Job.findOne();
        const updated = {
            description: "Updated description",
            type: "Part-time",
        };

        await api
            .put(`/api/jobs/${job._id}`)
            .send(updated)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const updatedJobCheck = await Job.findById(job._id);
        expect(updatedJobCheck.description).toBe(updated.description);
        expect(updatedJobCheck.type).toBe(updated.type);
    });

    it("should return 400 for invalid job ID when PUT /api/jobs/:id", async () => {
        const invalidId = "12345";
        await api.put(`/api/jobs/${invalidId}`).send({}).expect(400);
    });

    // DELETE /api/jobs/:id
    it("should delete one job by ID when DELETE /api/jobs/:id is called", async () => {
        const job = await Job.findOne();
        await api.delete(`/api/jobs/${job._id}`).expect(204);

        const deletedJobCheck = await Job.findById(job._id);
        expect(deletedJobCheck).toBeNull();
    });

    it("should return 400 for invalid job ID when DELETE /api/jobs/:id", async () => {
        const invalidId = "12345";
        await api.delete(`/api/jobs/${invalidId}`).expect(400);
    });
});
